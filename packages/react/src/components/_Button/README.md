# _Button

Overridding a button

When passing a custom button, the `onClick` handler should return true or false in order to submit the generated payload

```
<SignUpForm
  handleSuccess={() => {
    // ...
  }}
  button={<button onClick={() => {
    const canSubmit = validate();
    return canSubmit;
  }}>myButton</button>}
/>
```