# Login Form

A basic email and password login form. After a user has been created or completed the [sign up form](../SignUpForm/README.md), they will be authenticated against the API and be able to make additional requests. See the [`useNile` hook](../../../README.md) and the [the client src readme](../../lib/nile/src/README.md) for more details.

## Usage

```typescript
import { LoginForm, NileProvider } from '@theniledev/react';

const API_URL = 'http://localhost:8080'; // location of the Nile endpoint

function App() {
  return (
    <NileProvider basePath={API_URL}>
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

## Theming

[theming](../../../README.md#UI%20customization)
