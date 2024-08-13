import users, { matches as matchesUsers } from '../routes/users';
import tenants, { matches as matchesTenants } from '../routes/tenants';
import tenantUsers, {
  matches as matchesTenantUsers,
} from '../routes/tenants/[tenantId]/users';
import { Routes } from '../types';
import { Config } from '../../utils/Config';
import * as authRoutes from '../routes/auth';

export default function POSTER(configRoutes: Routes, config: Config) {
  return async function POST(req: Request) {
    // order matters for tenantUsers
    if (matchesTenantUsers(configRoutes, req)) {
      return tenantUsers(req, config);
    }

    if (matchesUsers(configRoutes, req)) {
      return users(req, config);
    }
    if (matchesTenants(configRoutes, req)) {
      return tenants(req, config);
    }

    if (authRoutes.matchSession(configRoutes, req)) {
      return authRoutes.handleSession(req, config);
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
    return new Response(null, { status: 404 });
  };
}
