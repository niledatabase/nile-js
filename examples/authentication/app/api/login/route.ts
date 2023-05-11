import { api } from '@/nile/Server';

export async function POST(req: Request) {
  return await api.login(req);
}
