type LoginSuccess = (LoginInfo: { email: string; password: string }) => void;
import { LabelOverride, InputOverride } from '../../theme';

export interface Props {
  handleSuccess: LoginSuccess;
  emailLabel?: React.ReactNode | LabelOverride;
  button?: React.ReactNode;
  emailInput?: React.ReactNode | InputOverride;
  passwordLabel?: React.ReactNode | LabelOverride;
  passwordInput?: React.ReactNode | InputOverride;
  handleFailure?: (error: Error) => void;
}
