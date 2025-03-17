import { EventHandlerRequest, getRequestURL, H3Event, readRawBody } from 'h3';

import { Server } from '../Server';

const convertHeader = ([key, value]: [
  string,
  string | string[] | undefined
]) => [
  key.toLowerCase(),
  Array.isArray(value) ? value.join(', ') : String(value),
];
export async function convertToRequest(
  event: H3Event<EventHandlerRequest>,
  nile: Server
) {
  const { handlers } = nile.api;
  const url = getRequestURL(event);
  const reqHeaders = event.node.req.headers;
  const headers: HeadersInit = reqHeaders
    ? Object.fromEntries(Object.entries(reqHeaders).map(convertHeader))
    : {};
  const method = event.node.req.method || 'GET';
  const body =
    method !== 'GET' && method !== 'HEAD' ? await readRawBody(event) : null;

  const request = new Request(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });
  switch (request.method) {
    case 'GET':
      return handlers.GET(request);
    case 'POST':
      return handlers.POST(request);
    case 'PUT':
      return handlers.PUT(request);
    case 'DELETE':
      return handlers.DELETE(request);
  }
}
