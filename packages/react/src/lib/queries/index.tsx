type ParamType = string | string[] | undefined;

enum Queries {
  Organizations = '/organizations',
  Entities = '/entities',
  Workspaces = '/workspaces',
  Instances = '/instances',
  Invites = '/invites',
  Users = '/users',
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

const GetInstance = (type: ParamType, org: ParamType, id: ParamType) => [
  `${ListInstances(type, org)}/${id}`,
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
};

export default queryKeys;
