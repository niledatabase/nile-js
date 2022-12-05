import { OidcWorkspaceLoginProviderNameEnum } from './client/src';

type ProviderFn = () => string;

export type SpaceProviders = {
  oidc: WorkspaceIdentityProviders;
};

export type WorkspaceIdentityProviders = {
  [provider in OidcWorkspaceLoginProviderNameEnum]: ProviderFn;
};

/**
 * Usecase for this would be an 'login' flow, a user signs up to the Nile app
 * @param workspace
 * @returns a dictionary of urls to navigate to for redirection
 */
export const workspaceProviders = (basePath?: string, workspace?: string) =>
  Object.values(OidcWorkspaceLoginProviderNameEnum).reduce(
    (accum: WorkspaceIdentityProviders, providerName) => {
      accum[providerName] = () =>
        [
          basePath,
          'workspaces',
          workspace,
          'oidc',
          'providers',
          providerName,
          'login',
        ].join('/');
      return accum;
    },
    {} as WorkspaceIdentityProviders
  );
