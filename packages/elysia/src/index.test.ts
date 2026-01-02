import { jest, describe, expect, it } from "@jest/globals";

import { elysia } from "./index";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FixAny = any;
// Define mocks
const mockHandlers = {
  GET: jest
    .fn<(req: Request, options: FixAny) => Promise<Response>>()
    .mockResolvedValue(
      new Response(JSON.stringify({ msg: "GET OK" }), { status: 200 })
    ),
  POST: jest
    .fn<(req: Request, options: FixAny) => Promise<Response>>()
    .mockResolvedValue(
      new Response(JSON.stringify({ msg: "POST OK" }), { status: 201 })
    ),
  PUT: jest
    .fn<(req: Request, options: FixAny) => Promise<Response>>()
    .mockResolvedValue(
      new Response(JSON.stringify({ msg: "PUT OK" }), { status: 200 })
    ),
  DELETE: jest
    .fn<(req: Request, options: FixAny) => Promise<Response>>()
    .mockResolvedValue(
      new Response(JSON.stringify({ msg: "DELETE OK" }), { status: 200 })
    ),
};

const mockNileInstance = {
  paths: {
    get: ["/api/test/{id}"],
    post: ["/api/submit/{formId}"],
    put: [],
    delete: [],
  },
  handlers: mockHandlers,
  withContext: jest.fn(async (ctx: FixAny, cb: FixAny) => {
    return cb({
      handlers: mockHandlers,
    });
  }),
};

describe("elysia extension", () => {
  it("registers routes pointing to server handlers", () => {
    const mockApp = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };

    const extensionFactory = elysia(mockApp as FixAny);
    const extension = extensionFactory();

    // Simulate Nile configuration phase
    if (extension.onConfigure) {
      extension.onConfigure(mockNileInstance as FixAny);
    }

    // Verify registrations
    // Note: mockHandlers.GET is passed directly
    expect(mockApp.get).toHaveBeenCalledWith("/api/test/:id", mockHandlers.GET);
    expect(mockApp.post).toHaveBeenCalledWith(
      "/api/submit/:formId",
      mockHandlers.POST
    );
  });

  it("onHandleRequest handles Elysia context", async () => {
    const mockApp = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };
    const extensionFactory = elysia(mockApp as FixAny);
    const extension = extensionFactory();
    if (extension.onConfigure) {
      extension.onConfigure(mockNileInstance as FixAny);
    }

    const ctx = {
      request: new Request("http://localhost/api/test", {
        method: "GET",
        headers: { "x-tenant-id": "tenant-1" },
      }),
      params: { tenantId: undefined },
      set: { headers: {} },
    };

    const result = await extension.onHandleRequest?.([ctx]);

    // Verify context passed to Nile
    const [context] = mockNileInstance.withContext.mock.lastCall as FixAny;
    expect(context.headers.get("x-tenant-id")).toBe("tenant-1");

    // Verify result
    expect(result).toBeInstanceOf(Response);

    // Verify callback execution: it calls handlers.GET with Request (not Context)
    expect(mockHandlers.GET).toHaveBeenCalledWith(ctx.request, {
      disableExtensions: ["elysia"],
    });
  });

  it("onHandleRequest ignores native Request", async () => {
    const mockApp = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };
    const extensionFactory = elysia(mockApp as FixAny);
    const extension = extensionFactory();
    if (extension.onConfigure) {
      extension.onConfigure(mockNileInstance as FixAny);
    }

    const req = new Request("http://localhost/api/test");
    const result = await extension.onHandleRequest?.([req]);

    expect(result).toBeUndefined();
  });

  it("registers and responds to default endpoints (e.g. /api/auth/csrf)", async () => {
    const mockApp = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };

    const nileWithDefaults = {
      ...mockNileInstance,
      paths: {
        ...mockNileInstance.paths,
        get: [...mockNileInstance.paths.get, "/api/auth/csrf"],
      },
    };

    const extensionFactory = elysia(mockApp as FixAny);
    const extension = extensionFactory();

    if (extension.onConfigure) {
      extension.onConfigure(nileWithDefaults as FixAny);
    }

    // Verify registration
    expect(mockApp.get).toHaveBeenCalledWith(
      "/api/auth/csrf",
      mockHandlers.GET
    );

    // Verify response
    const ctx = {
      request: new Request("http://localhost/api/auth/csrf", {
        method: "GET",
      }),
      params: {},
      set: { headers: {} },
    };

    const result = (await extension.onHandleRequest?.([ctx])) as Response;

    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(200);
    const body = await result.json();
    expect(body).toEqual({ msg: "GET OK" });
  });
});
