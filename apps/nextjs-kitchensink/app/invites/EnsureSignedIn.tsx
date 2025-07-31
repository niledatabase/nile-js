import { Google } from '@niledatabase/react';
import { User } from '@niledatabase/server';

export default async function EnsureSignedIn({
  children,
  me,
}: {
  children: React.ReactElement;
  me: User | Response;
}) {
  if (me instanceof Response) {
    return (
      <div className="p-10">
        <div className="text-7xl text-red-500">
          You need to log in before use/see your invites.
        </div>
        <Google callbackUrl="/invites" />
      </div>
    );
  }
  return children;
}
