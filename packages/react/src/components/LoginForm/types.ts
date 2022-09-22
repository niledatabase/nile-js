import { Attribute } from '../../lib/SimpleForm/types';

type LoginSuccess = (LoginInfo: { email: string; password: string }) => void;

export interface Props {
  onSuccess: LoginSuccess;
  onError?: (error: Error) => void;
  attributes?: Attribute[];
}
