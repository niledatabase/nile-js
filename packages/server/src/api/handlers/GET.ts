import Logger from '../../utils/Logger';
import me, { matches as matchesMe } from '../routes/me';
import users, { matches as matchesUsers } from '../routes/users';
import tenantUsers, {
  matches as matchesTenantUsers,
} from '../routes/tenants/[tenantId]/users';
import invite, {
  matches as matchesInvite,
} from '../routes/tenants/[tenantId]/invite';
import invites, {
  matches as matchesInvites,
} from '../routes/tenants/[tenantId]/invites';
import tenants, { matches as matchesTenants } from '../routes/tenants';
import { Routes } from '../types';
import * as authRoutes from '../routes/auth';
import { Config } from '../../utils/Config';

export default function GETTER(configRoutes: Routes, config: Config) {
  const { info, warn } = Logger(config, '[GET MATCHER]');
  return async function GET(req: Request) {
    if (matchesMe(configRoutes, req)) {
      info('matches me');
      return me(req, config);
    }
    // order matters for invites (matches against tenants and invite)
    if (matchesInvites(configRoutes, req)) {
      info('matches tenant invites');
      return invites(req, config);
    }

    if (matchesInvite(configRoutes, req)) {
      info('matches invite');
      return invite(req, config);
    }

    if (matchesTenantUsers(configRoutes, req)) {
      info('matches tenant users');
      return tenantUsers(req, config);
    }
    if (matchesTenants(configRoutes, req)) {
      info('matches tenants');
      return tenants(req, config);
    }

    if (matchesUsers(configRoutes, req)) {
      info('matches users');
      return users(req, config);
    }

    if (authRoutes.matchSession(configRoutes, req)) {
      info('matches session');
      return authRoutes.handleSession(req, config);
    }

    if (authRoutes.matchSignIn(configRoutes, req)) {
      info('matches signin');
      return authRoutes.handleSignIn(req, config);
    }

    if (authRoutes.matchProviders(configRoutes, req)) {
      info('matches providers');
      return authRoutes.handleProviders(req, config);
    }

    if (authRoutes.matchCsrf(configRoutes, req)) {
      info('matches csrf');
      return authRoutes.handleCsrf(req, config);
    }

    if (authRoutes.matchesPasswordReset(configRoutes, req)) {
      info('matches password reset');
      return authRoutes.handlePasswordReset(req, config);
    }

    if (authRoutes.matchCallback(configRoutes, req)) {
      info('matches callback');
      return authRoutes.handleCallback(req, config);
    }

    if (authRoutes.matchSignOut(configRoutes, req)) {
      info('matches signout');
      return authRoutes.handleSignOut(req, config);
    }

    if (authRoutes.matchesVerifyRequest(configRoutes, req)) {
      info('matches verify-request');
      return authRoutes.handleVerifyRequest(req, config);
    }

    if (authRoutes.matchesVerifyEmail(configRoutes, req)) {
      info('matches verify-email');
      return authRoutes.handleVerifyEmail(req, config);
    }

    if (authRoutes.matchError(configRoutes, req)) {
      info('matches error');
      return authRoutes.handleError(req, config);
    }
    warn(`No GET routes matched ${req.url}`);
    return new Response(null, { status: 404 });
  };
}
