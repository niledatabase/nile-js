import { Attribute } from '../../lib/SimpleForm/types';

type SignInSuccess = (loginInfo: { email: string; password: string }) => void;

export interface Props {
  onSuccess: SignInSuccess;
  onError?: (e: Error) => void;
  attributes?: Attribute[];
}
