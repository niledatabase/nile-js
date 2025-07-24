import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';

import { nile } from '../api/[...nile]/nile';

import { DataTable } from './table';
import selectTodos from './selectTodos';

import Code from '@/components/ui/code';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function GooglePage() {
  const todos = await selectTodos();
  const allTodos = await nile.db.query('select * from todos2');
  return (
    <div className="container mx-auto pt-40">
      <div className="flex flex-col gap-4">
        <div className="text-7xl">Google SSO</div>
        <p>
          Congrats, you logged in with Google. Behind the scenes, you were added
          to a tenant and some todos were created for you.
        </p>
        <p>Here are the steps that we went though to get to this page</p>
        <p>
          A google component was added to the{' '}
          <Link
            href="/google/login"
            className="text-primary underline-offset-4 hover:underline"
          >
            login page
          </Link>
        </p>
        <div className="pl-3">
          <Code file="app/google/login/page.tsx" />
          <div className="inline-flex gap-1">
            This interacts with the previously set up routes from
            <pre>@niledatabase/server</pre>
          </div>
          <Tabs defaultValue="nile">
            <TabsList className="w-full">
              <TabsTrigger value="nile">app/api/[...nile]/nile.ts</TabsTrigger>
              <TabsTrigger value="route">
                app/api/[...nile]/route.ts
              </TabsTrigger>
            </TabsList>
            <TabsContent value="route">
              <Code file="app/api/[...nile]/route.ts" noTitle />
            </TabsContent>
            <TabsContent value="nile">
              <Code file="app/api/[...nile]/nile.ts" noTitle />
            </TabsContent>
          </Tabs>
        </div>
        <div>
          Now lets look at the route code. We want to use the logged in user,
          but by this point in the flow, we still don&apos;t have a valid
          session. In order to convert the oauth response from google and query,
          we can automatically set the context from the{' '}
          <span className="font-mono text-white">withContext</span> handlers
          from the SDK.
        </div>
        <Code file="app/api/auth/callback/google/route.ts" />
        You can see your todos (depending on how many times you have logged in
        here). By default, if there is no tenant_id, all records will be
        returned, so a full query to handle this would be
        <Code file="app/google/selectTodos.ts" />
        <DataTable data={todos.rows} columns={columns} />
        To illustrate the point, I&apos;ve added a simple `await
        nile.db.query(&ldquo;select * from todos2&rdquo;)` without the
        protections of checking for a valid session. If you are logged out, you
        will still see values, so be careful!
        <DataTable data={allTodos.rows} columns={columns} />
      </div>
    </div>
  );
}

type Todo = {
  title: string;
  complete: string;
  id: string;
  tenantId: string;
};
const columns: ColumnDef<Todo>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'Complete',
    header: 'complete',
  },
  {
    accessorKey: 'id',
    header: 'Id',
  },
  {
    accessorKey: 'tenant_id',
    header: 'Tenant Id',
  },
];
