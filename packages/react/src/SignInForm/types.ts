import { QueryClient } from '@tanstack/react-query';

import { ComponentFetchProps } from '../../lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AllowedAny = any;

export type LoginInfo = { email: string; password: string };
type LoginSuccess = (
  response: AllowedAny,
  formValues: LoginInfo,
  ...args: AllowedAny
) => void;

export type Props = ComponentFetchProps & {
  beforeMutate?: (data: AllowedAny) => AllowedAny;
  onSuccess?: LoginSuccess;
  onError?: (error: Error, data: AllowedAny) => void;
  callbackUrl?: string;
  resetUrl?: string;
  client?: QueryClient;
  className?: string;
  baseUrl?: string;
  fetchUrl?: string;
};
