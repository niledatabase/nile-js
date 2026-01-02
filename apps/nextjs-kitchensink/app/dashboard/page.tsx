import { nile } from '../api/[...nile]/nile';

export default async function Dashboard() {
  const self1 = await nile.users.getSelf();
  const [tenants, me] = await nile.withContext(() =>
    Promise.all([nile.tenants.list(), nile.users.getSelf()])
  );
  return (
    <div className="mx-auto container p-4">
      <div>no context</div>
      <pre>
        <code>{JSON.stringify(self1, null, 2)}</code>
      </pre>
      <div>context stuff</div>
      <pre>
        <code>{JSON.stringify(me, null, 2)}</code>
      </pre>
      <div>Tenants:</div>
      <pre>
        <code>{JSON.stringify(tenants, null, 2)}</code>
      </pre>
    </div>
  );
}
