import { matchesLog } from '../../utils/Logger';
import tenants, { matches as matchesTenants } from '../routes/tenants';
import signup, { matches as matchesSignup } from '../routes/signup';
import tenantUsers, {
  matches as matchesTenantUsers,
} from '../routes/tenants/[tenantId]/users';
import inviteUsers, {
  matches as matchesInviteUsers,
} from '../routes/tenants/[tenantId]/invite';
import { Routes } from '../types';
import { ExtensionState } from '../../types';
import { Config } from '../../utils/Config';
import * as authRoutes from '../routes/auth';

export default function POSTER(configRoutes: Routes, config: Config) {
  const { info, warn, error } = config.logger('[POST MATCHER]');
  return async function POST(...params: unknown[]) {
    // convert whatever `req` we are getting to something that will work with express.
    const handledRequest = await config.extensionCtx?.runExtensions(
      ExtensionState.onHandleRequest,
      config,
      params
    );
    // if this has been overridden, we don't do anything else.
    // for express, when you do this, make a new internal instance that does not have
    // `onHandleRequest`
    if (handledRequest) {
      return handledRequest;
    }
    // the default
    const req = params[0] instanceof Request ? params[0] : null;
    if (!req) {
      error('Proxy requests failed, a Request object was not passed.');
      return;
    }
    // special case for logging client errors
    if (matchesLog(configRoutes, req)) {
      try {
        const json = await req.clone().json();
        error(req.body && json);
      } catch {
        error(await req.text());
      }
      return new Response(null, { status: 200 });
    }
    // order matters for tenantUsers
    if (matchesTenantUsers(configRoutes, req)) {
      info('matches tenant users');
      return tenantUsers(req, config);
    }
    // order matters for tenantInvites
    if (matchesInviteUsers(configRoutes, req)) {
      info('matches tenant invite');
      return inviteUsers(req, config);
    }

    if (matchesSignup(configRoutes, req)) {
      info('matches signup');
      return signup(req, config);
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
    if (authRoutes.matchesVerifyEmail(configRoutes, req)) {
      info('matches verify-email');
      return authRoutes.handleVerifyEmail(req, config);
    }

    warn(`No POST routes matched ${req.url}`);
    return new Response(null, { status: 404 });
  };
}
