import tenants, { matches as matchesTenants } from '../routes/tenants';
import tenantUsers, {
  matches as matchesTenantsUsers,
} from '../routes/tenants/[tenantId]/users';
import me, { matches as matchesMe } from '../routes/me';
import tenantUser, {
  matches as matchesTenantUser,
} from '../routes/tenants/[tenantId]/users/[userId]';
import invite, {
  matches as matchesInvite,
} from '../routes/tenants/[tenantId]/invite/[inviteId]';
import { Routes } from '../types';
import { Config } from '../../utils/Config';

export default function DELETER(configRoutes: Routes, config: Config) {
  const { info, warn } = config.logger('[DELETE MATCHER]');
  return async function DELETE(req: Request) {
    // order matters for tenantInvites
    if (matchesInvite(configRoutes, req)) {
      info('matches tenant invite id');
      return invite(req, config);
    }

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
