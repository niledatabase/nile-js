import { Google } from '@niledatabase/react';

export default async function Home() {
  return (
    <div className="flex min-h-svh flex-1 items-center justify-center">
      <Google callbackUrl="/google" />
    </div>
  );
}
