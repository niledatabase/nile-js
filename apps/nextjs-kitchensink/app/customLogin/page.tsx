import { nile } from '../api/[...nile]/nile';

import Form from './Form';

import Code from '@/components/ui/code';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function CustomLogin() {
  // create the user automatically, so sign in works right away
  const data = await nile.db.query(
    "select * from users.users where email = 'guy@guy.com'"
  );
  if (data.rowCount === 0) {
    await nile.auth.signUp({ email: 'guy@guy.com', password: 'guy@guy.com' });
  }
  return (
    <div className="container mx-auto p-10 flex flex-col gap-2">
      <div className="text-7xl">Action based sign in form</div>
      <div>
        This is an action based log in page. This would be the kind of page to
        make if you did not want to use any `@niledatabase/react` components, as
        this is entirely built using nextjs/shadcn. This page assumes that
        `guy@guy.com` exists.
      </div>
      <div>
        After sign in, you should see the{' '}
        <pre className="inline">{'<UserInfo />'}</pre> component. This will only
        show after log in, even if you are already signed in. This page is for
        showing sign in, after all.
      </div>
      <div className="mb-20">
        <Form />
      </div>
      <Tabs defaultValue="form">
        <TabsList className="w-full">
          <TabsTrigger value="form">app/customLogin/Form.tsx</TabsTrigger>
          <TabsTrigger value="action">
            app/customLogin/loginAction.ts
          </TabsTrigger>
        </TabsList>
        <TabsContent value="form">
          <Code file="app/customLogin/Form.tsx" />
        </TabsContent>
        <TabsContent value="action">
          <Code file="app/customLogin/loginAction.ts" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
