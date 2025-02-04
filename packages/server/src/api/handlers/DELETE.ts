import Logger from '../../utils/Logger';
import tenants, { matches as matchesTenants } from '../routes/tenants';
import tenantUsers, {
  matches as matchesTenantsUsers,
} from '../routes/tenants/[tenantId]/users';
import { Routes } from '../types';
import { Config } from '../../utils/Config';

export default function DELETER(configRoutes: Routes, config: Config) {
  const { info, warn } = Logger(config, '[DELETE MATCHER]');
  return async function DELETE(req: Request) {
    if (matchesTenantsUsers(configRoutes, req)) {
      info('matches tenant users');
      return tenantUsers(req, config);
    }
    if (matchesTenants(configRoutes, req)) {
      info('matches tenants');
      return tenants(req, config);
    }

    warn('No DELETE routes matched');
    return new Response(null, { status: 404 });
  };
}
