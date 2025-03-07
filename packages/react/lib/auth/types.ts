export type JWT = {
  email: string;
  sub: string;
  id: string;
  iat: number;
  exp: number;
  jti: string;
  loading: boolean;
};

type ActiveSession = {
  loading: boolean;
  id: string;
  email: string;
  expires: string;
  user?: {
    id: string;
    name: string;
    image: string;
    email: string;
    emailVerified: void | Date;
  };
};

export type NonErrorSession = JWT | ActiveSession | null | undefined;
export type NileSession = Response | NonErrorSession;
