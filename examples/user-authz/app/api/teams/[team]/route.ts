import { NextRequest } from 'next/server';

import { db } from '@/nile/Server';

export async function GET(req: NextRequest) {
  const teamName = req.nextUrl.pathname.split('/')[3];
  const [result] = await db('tenants')
    .select('id')
    .whereILike('name', teamName);
  return new Response(JSON.stringify(result));
}
