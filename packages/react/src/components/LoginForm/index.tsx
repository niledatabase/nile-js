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
  } = props;

  async function handleSubmit() {
    const email = document.querySelector('#email') as HTMLInputElement;
    const password = document.querySelector('#password') as HTMLInputElement;

    const payload = {
      email: email.value,
      password: password.value,
    };
    const success = await nile.login(payload).catch(() => {
      alert('things went bad');
    });
    if (success) {
      handleSuccess && handleSuccess(payload);
    }
  }

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
