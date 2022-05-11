type SignInSuccess = (loginInfo: { email: string; password: string }) => void;
import { LabelOverride, InputOverride } from '../../theme';

export interface Props {
  handleSuccess: SignInSuccess;
  emailLabel?: React.ReactNode | LabelOverride;
  button?: React.ReactNode;
  emailInput?: React.ReactNode | InputOverride;
  passwordLabel?: React.ReactNode | LabelOverride;
  passwordInput?: React.ReactNode | InputOverride;
  handleFailure?: (e: Error) => void;
}
