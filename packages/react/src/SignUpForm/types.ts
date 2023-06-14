import { Login200Response } from '@theniledev/browser';

import { Attribute } from '../lib/SimpleForm/types';

export type LoginInfo = { email: string; password: string };
type SignInSuccess = (
  response: Login200Response,
  formValues: LoginInfo
) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AllowedAny = any;

export interface Props {
  onSuccess: SignInSuccess;
  onError?: (e: Error, info: LoginInfo) => void;
  beforeMutate?: (data: AllowedAny) => AllowedAny;
  attributes?: Attribute[];
  buttonText?: string;
}
