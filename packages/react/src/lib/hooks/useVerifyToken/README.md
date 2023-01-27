# Oidc Token Refresh

Third-party cookies are disable by default on most browsers (or will be shortly in the future). In order to be sure Nile cookies are set properly for web clients, a temporary token is passed when a user uses SSO.

The temporary token is exchanged for a real token upon returning to your application. The logic for exchange is handled via `useVerifyToken`

## Usage

In the Nile administration dashboard OIDC configuration, a page can set for redirect (where users land based on sign-up/login). In order to do the token exchange, `useVerifyToken` must be placed within the component that is rendered upon redirect. Failing to do this will cause unauthroized errors `401`, and users will not be able to use the application. 

Assume the dashboard is configured to redirect logged in users to `https://app.mysweetapp.io/dashboard` and the login page is `https://app.mysweetapp.io/login`.

> ⚠️
> 
>  For demonstration purposes, local storage is configured to allow logins to persist across browser refreshes. By default, they are only stored in memory. By opting in to using local storage by passing the Nile provider the `tokenStorage={StorageOptions.LocalStorage}` prop, it opens the application up to cross-site scripting (XSS) attacks, as attackers are able to retrieve stored tokens.
>  
>  ⚠️

##### `pages/_app.tsx` (next.js)
```typescript
import { StorageOptions } from '@theniledev/js`;
import { NileProvider } from '@theniledev/react';

function MyApp({ Component, pageProps }) {
  return ( 
      <NileProvider tokenStorage={StorageOptions.LocalStorage}>
        <Component {...pageProps} />
     </NileProvider>
  );
}
```


##### `https://app.mysweetapp.io/login`

```typescript
import { GoogleLoginButton } from '@theniledev/react';
import { Stack, Typography } from '@mui/joy';

function App() {
  return (
    <Stack>
      <Typography level="h2">Sign in with SSO</Typography>
      <GoogleLoginButton />
    </Stack>
  );
}
```

##### `https://app.mysweetapp.io/dashboard`

```typescript
import { useVerifyToken } from '@theniledev/react';
import { Stack, Typography } from '@mui/joy';

function App() {
  const [success] = useVerifyToken();
  if (!success) {
    return 'Loading...';
  }
  return (
    <Stack>
      {/* add components here that will do authenticated requests. */}
      <Typography level="h3">Welcome back, Jack!</Typography>
    </Stack>
  );
}
```
