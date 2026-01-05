import { Elysia, Context as ElysiaContext } from "elysia";
import type { Server, Extension } from "@niledatabase/server";

const cleaner = (val: string) => val.replaceAll(/\{([^}]+)\}/g, ":$1");

export const elysia = (app: Elysia): Extension => {
  let instance: Server;

  return () => ({
    id: "elysia",
    onConfigure: (server: Server) => {
      instance = server;

      const paths = {
        get: instance.paths.get.map(cleaner),
        post: instance.paths.post.map(cleaner),
        put: instance.paths.put.map(cleaner),
        delete: instance.paths.delete.map(cleaner),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handlers = instance.handlers as any;

      paths.get.forEach((path) => app.get(path, handlers.GET));
      paths.post.forEach((path) => app.post(path, handlers.POST), {
        parse: "none",
      });
      paths.put.forEach((path) => app.put(path, handlers.PUT), {
        parse: "none",
      });
      paths.delete.forEach((path) => app.delete(path, handlers.DELETE), {
        parse: "none",
      });
    },

    onHandleRequest: async (params?: unknown[]) => {
      if (!instance) return;
      const arg = params?.[0];

      // If it's a raw Request, we let Nile handle it natively (or another extension)
      if (arg instanceof Request) {
        return;
      }

      // Check if it looks like an Elysia context
      // Elysia context has 'request', 'store', 'set', etc.
      // We do a loose check
      const ctx = arg as ElysiaContext;
      if (!ctx || typeof ctx !== "object" || !ctx.request || !ctx.set) {
        return;
      }

      const { request, params: pathParams, set } = ctx;
      const tenantId = pathParams?.tenantId;
      const headers = new Headers(request.headers);

      const context = {
        headers,
        tenantId,
      };

      const response = await instance.withContext(context, async (nileCtx) => {
        const method = request.method as "GET" | "POST" | "PUT" | "DELETE";

        return (await nileCtx.handlers[method](request, {
          disableExtensions: ["elysia"],
        })) as Response;
      });

      if (response instanceof Response) {
        response.headers.forEach((value, key) => {
          set.headers[key] = value;
        });
        set.status = response.status;
        return response;
      }
      return response;
    },
  });
};
