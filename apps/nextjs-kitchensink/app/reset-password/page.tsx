import { nile } from '../google-manual/localizedNile';

import ResetPasswordClientSide from './client';
import ResetPasswordServer from './server';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Code from '@/components/ui/code';

export default async function ResetPassword() {
  const me = await nile.users.getSelf();
  return (
    <div className="container mx-auto p-10 flex flex-col gap-2">
      <div className="text-7xl">Reset password</div>
      <div>There are two reasons to reset a password</div>
      <div>1. You want to change it</div>
      <div>2. You forgot what it is</div>
      <div>
        Lets assume the (easier) case first, and you are a user who is logged in
        and you want to reset your password. This form assumes you are logged in
        (which means you knew your old password...) and you want to update it.
        This will make a few REST calls to the routes in order to reset your
        password. It will generate a new verification token, verify that it is
        accurate, then update the password. It is possible to do this with a
        single call, but all roads lead through the routes.
      </div>
      <div>
        For the client component below, we 100% use all client side fetching.
        For the server component, we are using an action to do the same thing
      </div>
      {me instanceof Response ? (
        <div className="text-2xl text-red-600 py-20">
          You are not signed in. You must be signed in to reset your password
        </div>
      ) : null}
      <Tabs defaultValue="server">
        <TabsList className="w-full">
          <TabsTrigger value="client">Client</TabsTrigger>
          <TabsTrigger value="server">Server</TabsTrigger>
        </TabsList>
        <TabsContent value="client">
          <ResetPasswordClientSide
            email={'email' in me ? String(me?.email) : ''}
          />
          <Code file="app/reset-password/client.tsx" />
        </TabsContent>
        <TabsContent value="server">
          <ResetPasswordServer />
          <div className="flex flex-row justify-between">
            <Code file="app/reset-password/server.tsx" />
            <Code file="app/reset-password/resetForm.tsx" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
