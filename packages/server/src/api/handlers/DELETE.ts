import tenants, { matches as matchesTenants } from '../routes/tenants';
import tenantUsers, {
  matches as matchesTenantsUsers,
} from '../routes/tenants/[tenantId]/users';
import { Routes } from '../types';
import { Config } from '../../utils/Config';

export default function DELETER(configRoutes: Routes, config: Config) {
  return async function DELETE(req: Request) {
    if (matchesTenantsUsers(configRoutes, req)) {
      return tenantUsers(req, config);
    }
    if (matchesTenants(configRoutes, req)) {
      return tenants(req, config);
    }
    return new Response(null, { status: 404 });
  };
}
