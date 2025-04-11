import { PrefetchParams } from 'packages/react/lib/utils';

// could probably add CreateTenantUserRequest too.
export type SignUpInfo = {
  email: string;
  password: string;
  tenantId?: string;
  fetchUrl?: string;
  callbackUrl?: string;
  newTenantName?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AllowedAny = any;

export type Props = PrefetchParams & {
  onSuccess?: (response: Response, formValues: SignUpInfo) => void;
  onError?: (e: Error, info: SignUpInfo) => void;
  beforeMutate?: (data: AllowedAny) => AllowedAny;
  buttonText?: string;
  callbackUrl?: string;
  createTenant?: string | boolean;
  className?: string;
  redirect?: boolean;
};
