# Oidc Token Refresh

Third-party cookies are disable by default on most browsers (or will be shortly in the future). In order to be sure Nile cookies are set properly for web clients, a temporary token is passed when a user uses SSO.

The temporary token is exchanged for a real token upon returning to your application. The logic for exchange is handled via `useVerifyToken`

## Usage

In the dashboard configuration, a page is set for redirect (where your users land based on sign-up/login). Place `useVerifyToken` within the rendered component.

Assume the dashboard is configured to redirect logged in users to `https://app.mysweetapp.io/dashboard` and the login page is `https://app.mysweetapp.io/login`.

##### `https://app.mysweetapp.io/login`

```typescript
import { LoginForm, NileProvider } from '@theniledev/react';

function App() {
  return (
    <NileProvider>
      <h1>🤩 My Great App🤩</h1>
      <h2>Sign in</h2>
      <LoginForm
        onSuccess={() => {
          console.log('user has logged in');
        }}
      />
    </NileProvider>
  );
}
```

##### `https://app.mysweetapp.io/dashboard`

```typescript
import { useVerifyToken } from '@theniledev/react';
import { Stack, Typography } from '@mui/joy';

function App() {
  useVerifyToken();

  return (
    <Stack>
      <Typography level="h3">Welcome back, Jack!</Typography>
    </Stack>
  );
}
```
