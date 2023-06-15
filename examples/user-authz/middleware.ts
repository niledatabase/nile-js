import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import middleware from '@theniledev/edge';

// This function can be marked `async` if using `await` inside
export default async function doMiddleware(request: NextRequest) {
  const response = NextResponse.next();
  const tenantId = await getTenantId(request);
  // middleware(request, response, tenantId);
}

async function getTenantId(request: NextRequest): Promise<string> {
  const res = await fetch(
    `http://localhost:3000/api${request.nextUrl.pathname}`
  );
  const body = await res.json();
  return body.id;
}

export const config = {
  matcher: ['/teams/:team*'],
};
