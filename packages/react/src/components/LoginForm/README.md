# Login Form

A basic email and password login form. After a user has been created or completed the [sign up form](../SignUpForm/README.md), they will be authenticated against the API and be able to make additional requests. See the [`useNile` hook](../../../README.md) and the [the client src readme](../../lib/nile/src/README.md) for more details.

## Usage

```typescript
import { LoginForm, NileProvider } from '@theniledev/react';

const API_URL = 'http://localhost:8080'; // location of the Nile endpoint

function App() {
  return (
    <NileProvider apiUrl={API_URL}>
      <h1>🤩 My Great App🤩</h1>
      <h2>Sign in</h2>
      <LoginForm
        handleSuccess={() => {
          console.log('user has logged in');
        }}
      />
    </NileProvider>
  );
}
```

## Theming

### General theming (recommended)

[theming](../../theme/README.md)

### Advanced theming

The labels and inputs of this form are customizable via props. You can pass any `React.Node` to it, but at a minimum an `id` must use the passed into the customized `<input />` to ensure submission works properly. For completeness, spread all provided props input `<input />` or `<label />`and override as necessary.

```typescript
import { LoginForm, LabelOverride, InputOverride } from '@theniledev/react';

const EmailLabel = (props: LabelOverride) => {
  return (
    <label {...props} htmlFor="fancyName">
      Not an email
    </label>
  );
};

const EmailInput = (props: InputOverride) => (
  <>
    <img src="/fancy-name.svg" alt="fancy name" />
    <input {...props} type="email" name="fancyName" placeholder="Email" />
  </>
);

<LoginForm emailLabel={EmailLabel} emailInput={EmailInput} />;
```
