# GoogleLoginButton

When SSO is configured on a workspace, this button can be added to a Nile app the handle SSO login. Optionally, if an `org` property is passed to the component, the user will be added to the organization and then redirected.

## Usage

If your app makes requests to Nile directly (a common use case) be sure to include [`useVerifyToken`](../../lib/hooks/useVerifyToken) on the page you redirect users to on login.

```typescript
import { GoogleLoginButton, NileProvider } from '@theniledev/react';

function App() {
  return (
    <NileProvider>
      <h1>🤩 My Great App🤩</h1>
      <h2>Sign in</h2>
      <GoogleLoginButton />
    </NileProvider>
  );
}
```
