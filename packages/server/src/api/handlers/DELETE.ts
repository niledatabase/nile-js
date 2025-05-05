import Logger from '../../utils/Logger';
import tenants, { matches as matchesTenants } from '../routes/tenants';
import tenantUsers, {
  matches as matchesTenantsUsers,
} from '../routes/tenants/[tenantId]/users';
import me, { matches as matchesMe } from '../routes/me';
import tenantUser, {
  matches as matchesTenantUser,
} from '../routes/tenants/[tenantId]/users/[userId]';
import { Routes } from '../types';
import { Config } from '../../utils/Config';

export default function DELETER(configRoutes: Routes, config: Config) {
  const { info, warn } = Logger(config, '[DELETE MATCHER]');
  return async function DELETE(req: Request) {
    if (matchesTenantUser(configRoutes, req)) {
      info('matches tenant user');
      return tenantUser(req, config);
    }
    if (matchesTenantsUsers(configRoutes, req)) {
      info('matches tenant users');
      return tenantUsers(req, config);
    }

    if (matchesTenants(configRoutes, req)) {
      info('matches tenants');
      return tenants(req, config);
    }
    if (matchesMe(configRoutes, req)) {
      info('matches me');
      return me(req, config);
    }

    warn('No DELETE routes matched');
    return new Response(null, { status: 404 });
  };
}
