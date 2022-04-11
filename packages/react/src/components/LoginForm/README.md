# Login Form

A basic email and password login form.

## Usage

Assumes a `<NileProvider />` in a higher order component

```javascript
function LoginForm() {
  return (
    <>
      <h1>🤩 My Great App🤩</h1>
      <h2>Sign in</h2>
      <LoginForm
        handleSuccess={() => {
          // redirect to user profile
        }}
      />
    </>
  );
}
```

## Theming

### General theming (recommended)

[theming](../../theme/README.md)

### Advanced theming

The labels and inputs of this form are customizable via props. You can pass any `React.Node` to it, but at a minimum you must use the passed `id` prop to ensure submission works properly. For completeness, spread all provided props input `<input />` or `<label />`and override as necessary.

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
