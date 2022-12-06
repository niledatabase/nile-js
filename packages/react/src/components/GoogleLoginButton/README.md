# GoogleLoginButton

When SSO is configured on a workspace, this button can be added to a Nile app the handle SSO login. Optionally, if an `org` property is passed to the component, the user will be added to the organization and then redirected.

## Usage

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
