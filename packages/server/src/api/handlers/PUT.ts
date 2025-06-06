import Logger from '../../utils/Logger';
import users, { matches as matchesUsers } from '../routes/users';
import tenants, { matches as matchesTenants } from '../routes/tenants';
import me, { matches as matchesMe } from '../routes/me';
import tenantUsers, {
  matches as matchesTenantUsers,
} from '../routes/tenants/[tenantId]/users';
import tenantUser, {
  matches as matchesTenantUser,
} from '../routes/tenants/[tenantId]/users/[userId]';
import invite, {
  matches as matchesInvite,
} from '../routes/tenants/[tenantId]/invite';
import { handlePasswordReset, matchesPasswordReset } from '../routes/auth';
import { Routes } from '../types';
import { Config } from '../../utils/Config';

export default function PUTER(configRoutes: Routes, config: Config) {
  const { info, warn } = Logger(config, '[PUT MATCHER]');
  return async function PUT(req: Request) {
    // order matters for tenantInvites
    if (matchesInvite(configRoutes, req)) {
      info('matches tenant invite');
      return invite(req, config);
    }

    if (matchesTenantUser(configRoutes, req)) {
      info('matches tenant user');
      return tenantUser(req, config);
    }
    if (matchesTenantUsers(configRoutes, req)) {
      info('matches tenant users');
      return tenantUsers(req, config);
    }
    if (matchesUsers(configRoutes, req)) {
      info('matches users');
      return users(req, config);
    }
    if (matchesMe(configRoutes, req)) {
      info('matches me');
      return me(req, config);
    }
    if (matchesTenants(configRoutes, req)) {
      info('matches tenants');
      return tenants(req, config);
    }
    if (matchesPasswordReset(configRoutes, req)) {
      info('matches reset password');
      return handlePasswordReset(req, config);
    }
    warn('No PUT routes matched');
    return new Response(null, { status: 404 });
  };
}
