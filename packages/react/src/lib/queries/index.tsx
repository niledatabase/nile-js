type ParamType = string | string[] | undefined;

enum Queries {
  Organizations = '/organizations',
  Entities = '/entities',
  Workspaces = '/workspaces',
  Instances = '/instances',
  Invites = '/invites',
  Users = '/users',
  Authz = '/authz',
}

const ListOrganizations = [Queries.Organizations];
const ListWorkspaces = [Queries.Workspaces];
const ListEntities = [Queries.Entities];
const ListInstances = (type: ParamType, org: ParamType) => [
  `${Queries.Instances}/${type}/${org}`,
];

const ListInvites = [Queries.Invites];
const ListUsers = [Queries.Users];

const GetOrganization = (org: ParamType) => [`${Queries.Organizations}/${org}`];
const ListUsersInOrg = (org: ParamType) => [`${GetOrganization(org)}/users`];

const GetEntity = (type: ParamType) => [`${Queries.Entities}/${type}`];
const GetOpenApi = (type: ParamType) => [`${GetEntity(type)}/openapi`];

const GetUser = (id: ParamType) => [`${Queries.Users}/${id}`];

const GetMe = [`${Queries.Users}/me`];
const GetDeveloperToken = [`${Queries.Users}/token`];

const GetInstance = (type: ParamType, org: ParamType, id: ParamType) => [
  `${ListInstances(type, org)}/${id}`,
];

const ListPolicies = (org: ParamType) => [
  `${Queries.Authz}/${GetOrganization(org)}/policies`,
];
const GetPolicy = (org: ParamType, id: ParamType) => [
  `${Queries.Authz}/${GetOrganization(org)}/policies/${id}`,
];

const queryKeys = {
  ListWorkspaces,
  ListOrganizations,
  ListEntities,
  ListInstances,
  GetOrganization,
  ListInvites,
  GetEntity,
  GetInstance,
  GetUser,
  ListUsers,
  GetOpenApi,
  ListUsersInOrg,
  GetMe,
  GetDeveloperToken,
  ListPolicies,
  GetPolicy,
};

export default queryKeys;

export { useQuery } from './useQuery';
export { useMutation } from './useMutation';
export { useQueries } from './useQueries';
