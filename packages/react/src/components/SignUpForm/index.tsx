import React from 'react';
import { useNile } from '../../context';
import Button from '../_Button';
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
      .create('users', payload)
      .catch(() => alert('things went bad'));

    if (user) {
      handleSuccess && handleSuccess(user);
    }
  }

  return (
    <form>
      <label htmlFor="email">Email</label>
      <br />
      <input type="text" placeholder="email" id="email"></input>
      <br />
      <label htmlFor="email">Password</label>
      <br />
      <input type="password" placeholder="password" id="password"></input>
      <br />
      <br />
      <Button onClick={handleSubmit}>Sign up</Button>
    </form>
  );
}
