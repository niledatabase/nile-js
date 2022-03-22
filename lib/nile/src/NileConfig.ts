export interface NileConfig {
  apiUrl: string;
}
export interface NileSignIn {
  email: string;
  password: string;
}
export interface User {
  name: string;
}
export interface AuthResponse {
  token: string;
}

export type CreateableEntities = 'login' | 'users' | 'orgs';

export type UpdatableEntities = 'user';

export type UpdatableEntityUrls = `${UpdatableEntities}/${string}`

export interface APIResponse extends Response{
  [key: string]: unknown
}
