import { Attribute } from '../lib/SimpleForm/types';

type LoginSuccess = (
  token: string,
  LoginInfo: { email: string; password: string }
) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AllowedAny = any;

export interface Props {
  beforeMutate?: (data: AllowedAny) => AllowedAny;
  onSuccess: LoginSuccess;
  onError?: (error: Error, data: AllowedAny) => void;
  attributes?: Attribute[];
}
