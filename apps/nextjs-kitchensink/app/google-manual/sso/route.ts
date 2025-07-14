import { NextRequest } from 'next/server';

import { nile } from '../localizedNile';

export async function POST(req: NextRequest) {
  return await nile.auth.signIn('google', req);
}
