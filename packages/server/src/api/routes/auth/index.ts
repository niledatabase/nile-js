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
