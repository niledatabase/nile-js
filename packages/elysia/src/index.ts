import { Elysia, Context } from "elysia";
import type { Server } from "@niledatabase/server";

const cleaner = (val: string) => val.replaceAll(/\{([^}]+)\}/g, ":$1");

export const nilePlugin = <S extends Server>(nile: S) => {
  if (!nile) {
    throw new Error("Nile instance is required. usage: nile(myNile)");
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (typeof Bun !== "undefined") {
    nile.skipHostHeader = true;
  }

  const app = new Elysia({
    name: "nile",
    seed: nile,
  }).decorate("nile", nile);

  const paths = {
    GET: nile.paths.get.map(cleaner),
    POST: nile.paths.post.map(cleaner),
    PUT: nile.paths.put.map(cleaner),
    DELETE: nile.paths.delete.map(cleaner),
  };

  const createHandler =
    (method: "GET" | "POST" | "PUT" | "DELETE") => async (ctx: Context) => {
      const { request, params: pathParams, set } = ctx;
      const tenantId = pathParams?.tenantId;
      const headers = new Headers(request.headers);

      const context = {
        headers,
        tenantId,
      };

      const response = await nile.withContext(context, async (nileCtx) => {
        return (await nileCtx.handlers[method](request)) as Response;
      });

      if (response instanceof Response) {
        response.headers.forEach((value, key) => {
          set.headers[key] = value;
        });
        set.status = response.status;
        return response;
      }
      return response;
    };

  paths.GET.forEach((path) => app.get(path, createHandler("GET")));
  paths.POST.forEach((path) => app.post(path, createHandler("POST")));
  paths.PUT.forEach((path) => app.put(path, createHandler("PUT")));
  paths.DELETE.forEach((path) => app.delete(path, createHandler("DELETE")));

  return app;
};
