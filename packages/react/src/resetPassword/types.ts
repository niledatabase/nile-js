import { PrefetchParams } from '../../lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AllowedAny = any;

export type Params = PrefetchParams & {
  beforeMutate?: (data: AllowedAny) => AllowedAny;
  onSuccess?: (res: Response) => void;
  onError?: (error: Error, data: AllowedAny) => void;
  callbackUrl?: string;
};

export type MutateFnParams = {
  email?: string;
  password?: string;
};

export type Props = Params & {
  defaultValues?: MutateFnParams & {
    confirmPassword?: string;
  };
};
