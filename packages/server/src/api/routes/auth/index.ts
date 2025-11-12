export { default as handleSignIn, matches as matchSignIn } from './signin';
export { default as handleSession, matches as matchSession } from './session';
export {
  default as handleProviders,
  matches as matchProviders,
} from './providers';

export { default as handleCsrf, matches as matchCsrf } from './csrf';
export {
  default as handleCallback,
  matches as matchCallback,
} from './callback';

export { default as handleSignOut, matches as matchSignOut } from './signout';
export { default as handleError, matches as matchError } from './error';
export {
  default as handleVerifyRequest,
  matches as matchesVerifyRequest,
} from './verify-request';
export {
  default as handlePasswordReset,
  matches as matchesPasswordReset,
} from './password-reset';
export {
  default as handleVerifyEmail,
  matches as matchesVerifyEmail,
} from './verify-email';

export { default as handleMfa, matches as matchesMfa } from './mfa';
