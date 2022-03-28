import React from 'react';
import Button from '../_Button';
import { Props } from './types';
import { useNile } from '../../context';

export default function LoginForm({ handleSuccess }: Props) {
  const nile = useNile();

  async function handleSubmit() {
    const email = document.querySelector('#email') as HTMLInputElement;
    const password = document.querySelector('#password') as HTMLInputElement;

    const payload = {
      email: email.value,
      password: password.value,
    };
    const success = await nile
      .signIn(payload)
      .catch(() => alert('things went bad'));

    if (success) {
      handleSuccess && handleSuccess();
    }
  }

  return (
    <>
      <form>
        <label htmlFor="email">Email</label>
        <br />
        <input type="text" placeholder="email" id="email"></input>
        <br />
        <label htmlFor="password">Password</label>
        <br />
        <input type="password" placeholder="password" id="password"></input>
        <br />
        <br />
        <Button onClick={handleSubmit}>Sign in</Button>
      </form>
    </>
  );
}
