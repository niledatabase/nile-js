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

export type EntityType = 'login' | 'users' | 'orgs';
