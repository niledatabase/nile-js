import { CreateBasicUserRequest } from '@niledatabase/browser';
import { QueryClient } from '@tanstack/react-query';

export type SignUpInfo = CreateBasicUserRequest & {
  tenantId?: string;
  fetchUrl?: string;
  callbackUrl?: string;
  newTenantName?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AllowedAny = any;

export interface Props {
  onSuccess?: (response: Response, formValues: SignUpInfo) => void;
  onError?: (e: Error, info: SignUpInfo) => void;
  beforeMutate?: (data: AllowedAny) => AllowedAny;
  buttonText?: string;
  client?: QueryClient;
  callbackUrl?: string;
  baseUrl?: string;
  createTenant?: string | boolean;
}
