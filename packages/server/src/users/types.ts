export interface CreateBasicUserRequest {
  email: string;
  password: string;
  name?: string;
  familyName?: string;
  givenName?: string;
  picture?: string;
  // create a tenant for the new user to an existing tenant
  newTenantName?: string;
  // add the new user to an existing tenant
  tenantId?: string;
}
export interface CreateTenantUserRequest {
  email: string;
  password: string;
  name?: string;
  familyName?: string;
  givenName?: string;
  picture?: string;
}
export const LoginUserResponseTokenTypeEnum = {
  AccessToken: 'ACCESS_TOKEN',
  RefreshToken: 'REFRESH_TOKEN',
  IdToken: 'ID_TOKEN',
} as const;
export type LoginUserResponseTokenTypeEnum =
  (typeof LoginUserResponseTokenTypeEnum)[keyof typeof LoginUserResponseTokenTypeEnum];

export interface LoginUserResponseToken {
  jwt: string;
  maxAge: number;
  type: LoginUserResponseTokenTypeEnum;
}
export interface LoginUserResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  id: string;
  token: LoginUserResponseToken;
}
export interface User {
  id: string;
  email: string;
  name?: string | null;
  familyName?: string | null;
  givenName?: string | null;
  picture?: string | null;
  created: string;
  updated?: string;
  emailVerified?: string | null;
  tenants: { id: string }[];
}
