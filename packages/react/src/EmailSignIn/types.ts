import { QueryClient } from '@tanstack/react-query';
import { SignInOptions } from '@niledatabase/client';

export type EmailSignInInfo = SignInOptions;
type SignInSuccess = (response: Response) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AllowedAny = any;

export type Props = {
  redirect?: boolean;
  onSuccess?: SignInSuccess;
  onError?: (e: Error, info: EmailSignInInfo) => void;
  beforeMutate?: (data: AllowedAny) => AllowedAny;
  buttonText?: string;
  client?: QueryClient;
  callbackUrl?: string;
  init?: RequestInit;
};
