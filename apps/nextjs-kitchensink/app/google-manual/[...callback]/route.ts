import { NextRequest } from 'next/server';

import { nile } from '../localizedNile';

export async function GET(req: NextRequest) {
  return await nile.auth.callback('google', req);
}
