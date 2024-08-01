import { CreateBasicUserRequest, User } from '@niledatabase/browser';

import { Attribute } from '../lib/SimpleForm/types';

export type SignUpInfo = CreateBasicUserRequest;
type SignInSuccess = (response: void | User, formValues: SignUpInfo) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AllowedAny = any;

export interface Props {
  onSuccess: SignInSuccess;
  onError?: (e: Error, info: SignUpInfo) => void;
  beforeMutate?: (data: AllowedAny) => AllowedAny;
  attributes?: Attribute[];
  buttonText?: string;
}
