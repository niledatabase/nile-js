import { QueryClient } from '@tanstack/react-query';
import { SignInOptions } from 'next-auth/react';

export type EmailSignInInfo = SignInOptions;
type SignInSuccess = (response: Response) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AllowedAny = any;

export interface Props {
  redirect?: boolean;
  onSuccess?: SignInSuccess;
  onError?: (e: Error, info: EmailSignInInfo) => void;
  beforeMutate?: (data: AllowedAny) => AllowedAny;
  buttonText?: string;
  client?: QueryClient;
  callbackUrl?: string;
}
