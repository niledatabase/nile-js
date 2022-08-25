# Sign up form

A basic email and password form, which is the first step on a user's journey in a nile application. This registers them so they will be able to [login](../LoginForm/README.md) in the future.

## Usage

```typescript
import { SignUpForm, NileProvider } from '@theniledev/react';

const API_URL = 'http://localhost:8080'; // location of the Nile endpoint

function SignUp() {
  return (
    <NileProvider basePath={API_URL}>
      <h1>🤩 My Great App🤩</h1>
      <h2>Sign in</h2>
      <SignUpForm
        onSuccess={() => {
          console.log('a new user has signed up');
        }}
      />
    </NileProvider>
  );
}
```

## Theming

[theming](../../../README.md#UI%20customization)
