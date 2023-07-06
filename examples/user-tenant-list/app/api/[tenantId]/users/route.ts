import { api } from '@/nile/Server';

export async function POST(req: Request) {
  const created = await api.users.createTenantUser(req);
  if (created.status === 201) {
    return new Response(JSON.stringify(await created.json()), {
      status: created.status,
    });
  }
  return created;
}
