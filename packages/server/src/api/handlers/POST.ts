import Logger, { matchesLog } from '../../utils/Logger';
import users, { matches as matchesUsers } from '../routes/users';
import tenants, { matches as matchesTenants } from '../routes/tenants';
import signup, { matches as matchesSignup } from '../routes/signup';
import tenantUsers, {
  matches as matchesTenantUsers,
} from '../routes/tenants/[tenantId]/users';
import { Routes } from '../types';
import { Config } from '../../utils/Config';
import * as authRoutes from '../routes/auth';

export default function POSTER(configRoutes: Routes, config: Config) {
  const { info, warn, error } = Logger(config, '[POST MATCHER]');
  return async function POST(req: Request) {
    // special case for logging client errors
    if (matchesLog(configRoutes, req)) {
      try {
        const json = await req.clone().json();
        error(req.body && json);
      } catch (e) {
        error(await req.text());
      }
      return new Response(null, { status: 200 });
    }
    // order matters for tenantUsers
    if (matchesTenantUsers(configRoutes, req)) {
      info('matches tenant users');
      return tenantUsers(req, config);
    }

    if (matchesSignup(configRoutes, req)) {
      info('matches signup');
      return signup(req, config);
    }

    if (matchesUsers(configRoutes, req)) {
      info('matches users');
      return users(req, config);
    }
    if (matchesTenants(configRoutes, req)) {
      info('matches tenants');
      return tenants(req, config);
    }

    if (authRoutes.matchSession(configRoutes, req)) {
      info('matches session');
      return authRoutes.handleSession(req, config);
    }

    if (authRoutes.matchSignIn(configRoutes, req)) {
      info('matches signin');
      return authRoutes.handleSignIn(req, config);
    }
    if (authRoutes.matchesPasswordReset(configRoutes, req)) {
      info('matches password reset');
      return authRoutes.handlePasswordReset(req, config);
    }

    if (authRoutes.matchProviders(configRoutes, req)) {
      info('matches providers');
      return authRoutes.handleProviders(req, config);
    }

    if (authRoutes.matchCsrf(configRoutes, req)) {
      info('matches csrf');
      return authRoutes.handleCsrf(req, config);
    }

    if (authRoutes.matchCallback(configRoutes, req)) {
      info('matches callback');
      return authRoutes.handleCallback(req, config);
    }
    if (authRoutes.matchSignOut(configRoutes, req)) {
      info('matches signout');
      return authRoutes.handleSignOut(req, config);
    }
    warn(`No POST routes matched ${req.url}`);
    return new Response(null, { status: 404 });
  };
}
