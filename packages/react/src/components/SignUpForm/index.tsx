import React from 'react';
import { useNile } from '../../context';
import Button from '../_Button';
import { Label, Input } from '../_Themeable';

import { Props } from './types';

export default function SignUpForm(props: Props) {
  const { handleSuccess } = props;
  const nile = useNile();
  async function handleSubmit() {
    const email = document.querySelector('#email') as HTMLInputElement;
    const password = document.querySelector('#password') as HTMLInputElement;

    const payload = {
      email: email.value,
      password: password.value,
    };
    const user = await nile
      .createUser(payload)
      .catch(() => alert('things went bad'));

    if (user) {
      handleSuccess && handleSuccess(user);
    }
  }

  return (
    <form>
      <Label htmlFor="email" text="Email"></Label>
      <Input name="email" />
      <Label htmlFor="password" text="Password" />
      <Input name="password" />
      <Button onClick={handleSubmit} name="signupButton" text="Sign up" />
    </form>
  );
}
