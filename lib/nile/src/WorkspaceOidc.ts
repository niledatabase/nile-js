import { OidcWorkspaceLoginProviderNameEnum } from './client/src';

type ProviderFn = () => string;

export type SpaceProviders = {
  oidc: {
    providers: WorkspaceIdentityProviders;
    logout: string;
  };
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

/**
 *
 * @param basePath the FQDN from the config object
 * @param workspace the nile workspace
 * @returns a string to link to remove the session
 */
export const workspaceLogout = (basePath?: string, workspace?: string) => {
  return [basePath, 'workspaces', workspace, 'oidc', 'signout'].join('/');
};
