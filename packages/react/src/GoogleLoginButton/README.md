# GoogleSSOButton

When SSO is configured on a workspace, this button can be added to handle SSO login.

## Usage

```typescript
import { NileProvider } from '@niledatabase/react';
import GoogleSSOButton from '@niledatabase/react/GoogleSSOButton';

function App() {
  return (
    <NileProvider>
      <h1>🤩 Google SSO Example 🤩</h1>
      <h2>Sign in</h2>
      <GoogleSSOButton />
    </NileProvider>
  );
}
```
