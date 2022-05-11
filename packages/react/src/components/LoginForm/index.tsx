import React from 'react';

import Button from '../_Button';
import { useNile } from '../../context';
import { Label, Input } from '../_Themeable';

import { Props } from './types';

export default function LoginForm(props: Props) {
  const nile = useNile();
  const {
    button,
    emailInput,
    emailLabel,
    passwordLabel,
    passwordInput,
    handleSuccess,
    handleFailure,
  } = props;

  const email =
    typeof document !== 'undefined' &&
    (document.querySelector('#login #email') as HTMLInputElement);
  const password =
    typeof document !== 'undefined' &&
    (document.querySelector('#login #password') as HTMLInputElement);
  const emailValue = email ? email.value : '';
  const passwordValue = password ? password.value : '';

  const handleSubmit = React.useCallback(
    async function () {
      const loginInfo = {
        email: emailValue,
        password: passwordValue,
      };

      const success = await nile.login({ loginInfo }).catch((e) => {
        handleFailure && handleFailure(e);
      });

      if (success) {
        handleSuccess && handleSuccess(loginInfo);
      }
    },
    [emailValue, handleFailure, handleSuccess, nile, passwordValue]
  );

  return (
    <form id="login">
      <Label node={emailLabel} htmlFor="email" text="Email" />
      <Input node={emailInput} name="email" />
      <Label node={passwordLabel} htmlFor="password" text="Password" />
      <Input node={passwordInput} name="password" />
      <Button
        node={button}
        onClick={handleSubmit}
        text="Log in"
        name="loginButton"
      />
    </form>
  );
}
