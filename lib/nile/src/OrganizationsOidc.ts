import { OidcOrganizationLoginProviderNameEnum } from './client/src';

type ProviderFn = (org: string) => string;

export type OrgProviders = {
  oidc: OrgaizationsIdentityProviders;
};

export type OrgaizationsIdentityProviders = {
  [provider in OidcOrganizationLoginProviderNameEnum]: ProviderFn;
};

/**
 * Usecase for this would be an 'invite' flow, where you want to have a user
 * sign up and be added to inviter org
 * @param workspace
 * @returns a dictionary of urls to navigate to for redirection
 */
export const organizationProviders = (basePath?: string, workspace?: string) =>
  Object.values(OidcOrganizationLoginProviderNameEnum).reduce(
    (accum: OrgaizationsIdentityProviders, providerName) => {
      accum[providerName] = (org: string) =>
        [
          basePath,
          'workspaces',
          workspace,
          'orgs',
          org,
          'oidc',
          'providers',
          providerName,
          'login',
        ].join('/');
      return accum;
    },
    {} as OrgaizationsIdentityProviders
  );
