import { ExtensionState } from '../../types';
import tenants, { matches as matchesTenants } from '../routes/tenants';
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
  const { error, info, warn } = config.logger('[DELETE MATCHER]');
  return async function DELETE(...params: unknown[]) {
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
    // order matters for tenantInvites
    if (matchesInvite(configRoutes, req)) {
      info('matches tenant invite id');
      return invite(req, config);
    }

    if (matchesTenantUser(configRoutes, req)) {
      info('matches tenant user');
      return tenantUser(req, config);
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
