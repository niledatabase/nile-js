import { QueryClient } from '@tanstack/react-query';

export type Props = Params & {
  client?: QueryClient;
  callbackUrl?: string;
  defaultValues?: MutateFnParams & {
    confirmPassword?: string;
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AllowedAny = any;

export interface Params {
  beforeMutate?: (data: AllowedAny) => AllowedAny;
  onSuccess?: (res: Response) => void;
  onError?: (error: Error, data: AllowedAny) => void;
  callbackUrl?: string;
  client?: QueryClient;
  fetchUrl?: string;
  baseUrl?: string;
}

export type MutateFnParams = {
  email?: string;
  password?: string;
};
