import users, { matches as matchesUsers } from '../routes/users';
import tenants, { matches as matchesTenants } from '../routes/tenants';
import tenantUsers, {
  matches as matchesTenantUsers,
} from '../routes/tenants/[tenantId]/users';
import { Routes } from '../types';
import { Config } from '../../utils/Config';

export default function PUTER(configRoutes: Routes, config: Config) {
  return async function PUT(req: Request) {
    console.log('in here for sure');
    if (matchesTenantUsers(configRoutes, req)) {
      return tenantUsers(req, config);
    }
    if (matchesUsers(configRoutes, req)) {
      return users(req, config);
    }
    if (matchesTenants(configRoutes, req)) {
      return tenants(req, config);
    }
    return new Response(null, { status: 404 });
  };
}
