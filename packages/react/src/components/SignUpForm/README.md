# Sign up form

A basic email and password form, which is the first step on a user's journey in a nile application. This registers them so they will be able to [login](../LoginForm/README.md) in the future.

## Usage

```typescript
import { SignUpForm, NileProvider } from '@theniledev/react';

const API_URL = 'http://localhost:8080'; // location of the Nile endpoint

function SignUp() {
  return (
    <NileProvider apiUrl={API_URL}>
      <h1>🤩 My Great App🤩</h1>
      <h2>Sign in</h2>
      <SignUpForm
        handleSuccess={() => {
          console.log('a new user has signed up');
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
import { SignUpForm, LabelOverride, InputOverride } from '@theniledev/react';

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

<SignUpForm emailLabel={EmailLabel} emailInput={EmailInput} />;
```
