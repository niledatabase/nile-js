import { ComponentFetchProps, PrefetchParams } from '../../lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AllowedAny = any;

export type Params = ComponentFetchProps &
  PrefetchParams & {
    beforeMutate?: (data: AllowedAny) => AllowedAny;
    onSuccess?: (res: Response | undefined) => void;
    onError?: (error: Error, data: AllowedAny) => void;
    callbackUrl?: string;
    basePath?: string;
    redirect?: boolean;
  };

export type MutateFnParams = {
  email: string;
  password?: string;
};

export type Props = Params & {
  className?: string;
  defaultValues?: MutateFnParams & {
    confirmPassword?: string;
  };
};
