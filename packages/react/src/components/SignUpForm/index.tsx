import React from 'react';
import { useNile } from '../../context';
import Button from '../_Button';
import { Label, Input } from '../_Themeable';

import { Props } from './types';

export default function SignUpForm(props: Props) {
  const { button, emailInput, emailLabel, passwordLabel, passwordInput, handleSuccess } = props;
  const nile = useNile();
  async function handleSubmit() {
    const email = document.querySelector('#email') as HTMLInputElement;
    const password = document.querySelector('#password') as HTMLInputElement;

    const payload = {
      email: email.value,
      password: password.value,
    };
  
    
    await nile
      .createUser(payload)
      .catch(() => alert('things went bad'));
      handleSuccess && handleSuccess();
  }

  return (
    <form id="signup">
      <Label node={emailLabel} htmlFor={'email'} text="Email" />
      <Input node={emailInput} name="email" />
      <Label node={passwordLabel} htmlFor="password" text="Password" />
      <Input node={passwordInput} name="password" />
      <Button node={button} onClick={handleSubmit} text="Sign up" name="signupButton" />
    </form>
  );
}
