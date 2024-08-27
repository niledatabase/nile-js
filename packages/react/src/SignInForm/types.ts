import { Attribute } from '../lib/SimpleForm/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AllowedAny = any;

export type LoginInfo = { email: string; password: string };
type LoginSuccess = (
  response: AllowedAny,
  formValues: LoginInfo,
  ...args: AllowedAny
) => void;

export interface Props {
  beforeMutate?: (data: AllowedAny) => AllowedAny;
  onSuccess?: LoginSuccess;
  onError?: (error: Error, data: AllowedAny) => void;
  attributes?: Attribute[];
  disableSSO?: boolean;
  callbackUrl?: string;
}
