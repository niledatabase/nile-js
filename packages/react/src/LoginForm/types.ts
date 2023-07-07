import { LoginRequest } from '@theniledev/browser';

import { Attribute } from '../lib/SimpleForm/types';

export type LoginInfo = { email: string; password: string };
type LoginSuccess = (response: LoginRequest, formValues: LoginInfo) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AllowedAny = any;

export interface Props {
  beforeMutate?: (data: AllowedAny) => AllowedAny;
  onSuccess: LoginSuccess;
  onError?: (error: Error, data: AllowedAny) => void;
  attributes?: Attribute[];
}
