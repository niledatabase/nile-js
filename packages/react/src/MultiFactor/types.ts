export type MfaMethod = 'authenticator' | 'email';
export type ChallengeScope = 'setup' | 'challenge';

export type AuthenticatorSetup = {
  method: 'authenticator';
  token: string;
  scope: ChallengeScope;
  otpauthUrl?: string;
  secret?: string;
  recoveryKeys?: string[];
};

export type EmailSetup = {
  method: 'email';
  token: string;
  scope: ChallengeScope;
  maskedEmail?: string;
};

export type CopyState = 'idle' | 'copied' | 'error';

export type EnrollMfaProps = {
  enrolled?: boolean;
  enrolledMethod?: MfaMethod | null;
  onRedirect?: (url: string) => void;
  onChallengeRedirect?: (params: ChallengeRedirect) => void;
};

export type ChallengeRedirect = {
  token: string;
  method: MfaMethod;
  scope: ChallengeScope;
  destination?: string;
};

export type MfaSetup = AuthenticatorSetup | EmailSetup;

export type AuthenticatorSetupProps = {
  setup: AuthenticatorSetup;
  onError: (message: string | null) => void;
  onSuccess: (scope: 'setup' | 'challenge') => void;
};

export type EnrollmentError =
  | 'setup'
  | 'disable'
  | 'parseSetup'
  | 'parseDisable'
  | null;

export type UseMfaEnrollmentOptions = {
  method: MfaMethod;
  currentMethod: MfaMethod | null;
  onRedirect?: (url: string) => void;
  onChallengeRedirect?: (params: ChallengeRedirect) => void;
};

export type UseMfaEnrollmentResult<TSetup extends MfaSetup> = {
  setup: TSetup | null;
  loading: boolean;
  errorType: EnrollmentError;
  startSetup: () => Promise<void>;
  startDisable: () => Promise<void>;
};
