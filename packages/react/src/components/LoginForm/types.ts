type LoginSuccess = (LoginInfo: { email: string; password: string }) => void;

export interface Props {
  onSuccess: LoginSuccess;
  onError?: (error: Error) => void;
}
