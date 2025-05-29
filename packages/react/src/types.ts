import { PartialAuthorizer, Authorizer } from '@niledatabase/client';

export interface SignInResponse {
  error: string | null;
  status: number;
  ok: boolean;
  url: string | null;
}

export type SSOButtonProps = {
  callbackUrl?: string;
  buttonText?: string;
  init?: RequestInit;
  baseUrl?: string;
  fetchUrl?: string;
  auth?: Authorizer | PartialAuthorizer;
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    res: SignInResponse | undefined
  ) => void;
};
