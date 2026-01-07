import { jest, describe, expect, it } from "@jest/globals";
import { Elysia } from "elysia";

import { nilePlugin } from "./index";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FixAny = any;

// Define mocks
const mockHandlers = {
  GET: jest
    .fn<(req: Request) => Promise<Response>>()
    .mockResolvedValue(
      new Response(JSON.stringify({ msg: "GET OK" }), { status: 200 })
    ),
  POST: jest
    .fn<(req: Request) => Promise<Response>>()
    .mockResolvedValue(
      new Response(JSON.stringify({ msg: "POST OK" }), { status: 201 })
    ),
  PUT: jest
    .fn<(req: Request) => Promise<Response>>()
    .mockResolvedValue(
      new Response(JSON.stringify({ msg: "PUT OK" }), { status: 200 })
    ),
  DELETE: jest
    .fn<(req: Request) => Promise<Response>>()
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

describe("Elysia Nile integration", () => {
  it("registers routes pointing to server handlers", async () => {
    const app = new Elysia().use(nilePlugin(mockNileInstance as FixAny));

    // We can verify by sending a request to the app
    const req = new Request("http://localhost/api/test/123");
    const res = await app.handle(req);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ msg: "GET OK" });

    // Verify mock handler called
    expect(mockHandlers.GET).toHaveBeenCalled();
    const [calledReq] = mockHandlers.GET.mock.lastCall!;
    expect(calledReq).toBeInstanceOf(Request);
    expect(calledReq.url).toContain("/api/test/123");
  });

  it("passes context and tenantId to Nile", async () => {
    // Let's add a tenant path to mock
    const nileWithTenant = {
      ...mockNileInstance,
      paths: {
        ...mockNileInstance.paths,
        get: ["/api/tenants/{tenantId}/users"],
      },
    };

    const app = new Elysia().use(nilePlugin(nileWithTenant as FixAny));

    const req = new Request("http://localhost/api/tenants/my-tenant/users");
    await app.handle(req);

    expect(mockNileInstance.withContext).toHaveBeenCalled();
    const [context] = mockNileInstance.withContext.mock.lastCall as FixAny;

    expect(context.tenantId).toBe("my-tenant");
  });

  it("throws if nile instance is missing", () => {
    expect(() => {
      // @ts-expect-error - should be there
      nilePlugin(undefined);
    }).toThrow("Nile instance is required");
  });

  it("allows chaining methods and accessing decorated context", async () => {
    const req = new Request("http://localhost/extra");
    const app = new Elysia()
      .use(nilePlugin(mockNileInstance as FixAny))
      .get("/extra", ({ nile }) => {
        return nile ? "has-nile" : "no-nile";
      });

    const res = await app.handle(req);
    expect(await res.text()).toBe("has-nile");
  });
});
