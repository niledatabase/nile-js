import { Login200Response } from '@theniledev/browser';

import { Attribute } from '../lib/SimpleForm/types';

type LoginInfo = { email: string; password: string };
type SignInSuccess = (
  response: Login200Response,
  formValues: LoginInfo
) => void;

export interface Props {
  onSuccess: SignInSuccess;
  onError?: (e: Error, info: LoginInfo) => void;
  attributes?: Attribute[];
  buttonText?: string;
}
