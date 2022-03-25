# Login Form

A basic email and password login form.

## Usage

Assumes a `<NileProvider />` in a higher order component

```javascript
function SignIn() {
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

React.render('root', <MyApp />);
```

## Theming

[theming](../../theme/README.md)
