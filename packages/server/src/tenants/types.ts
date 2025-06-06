export type Tenant = {
  id: string;
  name: string;
};

export type Invite = {
  id: string;
  tenant_id: string;
  token: string;
  identifier: string;
  roles: null | string;
  created_by: string;
  expires: Date;
};
