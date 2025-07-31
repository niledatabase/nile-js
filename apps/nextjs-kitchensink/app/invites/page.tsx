import CreateTenant from './InvitesIndex';

import Code from '@/components/ui/code';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function Invites() {
  return (
    <div className="container mx-auto flex flex-col">
      <CreateTenant />
      <div className="p-10 flex flex-col gap-4">
        <div>
          This page is dedicated to user invites, with some light tenant
          management for illustrative purposes. We are not using anything inside
          of `@niledatabase/client` here, we only using the server side SDK to
          accomplish this page
        </div>
        <div>
          This lists the current logged in users tenants, and allows them to
          invite random email addresses to their tenant. One thing to note is
          that nile-auth emails are string specific, so
          `your.name.here@gmail.com` is different than `yournamehere@gmail.com`,
          even though an email service like gmail considers them the same thing.
        </div>
        Because this app is written with NextJS, there are some frameworks
        specific things that we have to do to get our context set correctly.
        <Code file="app/api/[...nile]/nile.ts" />
        Basically, we need to get the cookies and headers, and the
        `nile.tenant-id` cookie for the active tenant, and set the context
        accordingly when we begin to make requests. the `nextjs` extension for
        the sdk does this automatically for us.
        <div>
          The next thing we need to defensively check against `me`. Since this
          is a page we expect logged in users to visit, we can give them some
          information about what we expect. You could do something like
          `nile.auth.getSession` here, but since we need to get the user&apos;s
          info, and the endpoint returns `Response` for unauthorized (or other
          failures), we can safely and easily handle that.
          <Code file="app/invites/EnsureSignedIn.tsx" />
        </div>
        <div>
          As to the meat of the code, we are using some build-in react
          components, as well as some custom ones. A lot of this is just
          standard, boilerplate adjacent code. The Nile specific parts are
          listing invites, users, and tenants, then in `actions.ts`, having CRUD
          actions on those entities.
        </div>
        <Tabs defaultValue="tables">
          <TabsList className="w-full">
            <TabsTrigger value="tables">
              app/invites/TenantsAndTables.tsx
            </TabsTrigger>
            <TabsTrigger value="invite">
              app/invites/InviteUserToTenant.tsx
            </TabsTrigger>
            <TabsTrigger value="invitesTable">
              app/invites/InvitesTable.tsx
            </TabsTrigger>
            <TabsTrigger value="membersTable">
              app/invites/MembersTable.tsx
            </TabsTrigger>
            <TabsTrigger value="actions">app/invites/actions.tsx</TabsTrigger>
          </TabsList>
          <TabsContent value="tables">
            <Code file="app/invites/TenantsAndTables.tsx" />
          </TabsContent>
          <TabsContent value="invite">
            <Code file="app/invites/InviteUserToTenant.tsx" />
          </TabsContent>
          <TabsContent value="invitesTable">
            <Code file="app/invites/InvitesTable.tsx" />
          </TabsContent>
          <TabsContent value="membersTable">
            <Code file="app/invites/MembersTable.tsx" />
          </TabsContent>
          <TabsContent value="actions">
            <Code file="app/invites/actions.ts" />
          </TabsContent>
        </Tabs>
        <div>
          With all that done, all we have to do is stitch {'<EnsureSignedIn/>'}{' '}
          and {'<TenantsAndTables/>'}.
          <Code file="app/invites/InvitesIndex.tsx" />
        </div>
      </div>
    </div>
  );
}
