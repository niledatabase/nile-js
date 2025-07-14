import { nile } from '../api/[...nile]/nile';

export default async function Dashboard() {
  const me = await nile.users.getSelf();
  return <div>{JSON.stringify(me)}</div>;
}
