import me, { matches as matchesMe } from '../routes/me';
import users, { matches as matchesUsers } from '../routes/users';
import tenants, { matches as matchesTenants } from '../routes/tenants';
import { Routes } from '../types';
import * as authRoutes from '../routes/auth';
import { Config } from '../../utils/Config';

export default function GETTER(configRoutes: Routes, config: Config) {
  return async function GET(req: Request) {
    if (matchesMe(configRoutes, req)) {
      return me(req, config);
    }
    if (matchesUsers(configRoutes, req)) {
      return users(req, config);
    }
    if (matchesTenants(configRoutes, req)) {
      return tenants(req, config);
    }
    if (authRoutes.matchSession(configRoutes, req)) {
      return authRoutes.handleSession(req);
    }

    if (authRoutes.matchSignIn(configRoutes, req)) {
      return authRoutes.handleSignIn(req);
    }

    if (authRoutes.matchProviders(configRoutes, req)) {
      return authRoutes.handleProviders(req);
    }

    if (authRoutes.matchCsrf(configRoutes, req)) {
      return authRoutes.handleCsrf(req);
    }

    if (authRoutes.matchCallback(configRoutes, req)) {
      return authRoutes.handleCallback(req);
    }
    if (authRoutes.matchSignOut(configRoutes, req)) {
      return authRoutes.handleSignOut(req);
    }
    if (authRoutes.matchError(configRoutes, req)) {
      return authRoutes.handleError(req);
    }
    return new Response(null, { status: 404 });
  };
}
