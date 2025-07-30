import ListTenants from './ListTenants';

import Code from '@/components/ui/code';

export default async function TenantList() {
  return (
    <div className="flex flex-col container mx-auto p-10 gap-4">
      <div className="text-7xl my-20">Tenant list</div>
      <div>
        A basic page to show a list of tenants. In some cases, you may want to
        make multiple requests through the nile sdk. To ensure the context is
        correct for every request, wrap the call in `nile.withContext`. This is
        especially important if you are not leveraging cookies in your
        application.
      </div>
      <Code file="app/tenant-list/ListTenants.tsx" />
      <ListTenants />
    </div>
  );
}
