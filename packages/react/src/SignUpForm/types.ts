import { CreateBasicUserRequest } from '@niledatabase/browser';
import { QueryClient } from '@tanstack/react-query';

export type SignUpInfo = CreateBasicUserRequest & {
  tenantId?: string;
  fetchURL?: string;
  callbackUrl?: string;
  newTenantName?: string;
};
type SignInSuccess = (response: Response, formValues: SignUpInfo) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AllowedAny = any;

export interface Props {
  onSuccess?: SignInSuccess;
  onError?: (e: Error, info: SignUpInfo) => void;
  beforeMutate?: (data: AllowedAny) => AllowedAny;
  buttonText?: string;
  client?: QueryClient;
  callbackUrl?: string;
  baseUrl?: string;
}
