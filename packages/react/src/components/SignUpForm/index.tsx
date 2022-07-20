import React from 'react';
import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';

import { useNile } from '../../context';
import Button from '../_Button';
import { Label, Input } from '../_Themeable';

import { Props } from './types';

export default function SignUpForm(props: Props) {
  const {
    button,
    emailInput,
    emailLabel,
    passwordLabel,
    passwordInput,
    handleSuccess,
  } = props;
  const nile = useNile();

  const mutation = useMutation(
    (createUserRequest: { email: string; password: string }) =>
      nile.users.createUser({ createUserRequest })
  );

  const mutate = mutation.mutate;

  const wrapSuccess = React.useCallback(
    (payload) => handleSuccess && handleSuccess(payload),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const getEmailAndPassword = React.useCallback(() => {
    const email = document.querySelector('#signup #email') as HTMLInputElement;
    const password = document.querySelector(
      '#signup #password'
    ) as HTMLInputElement;
    return [email.value, password.value];
  }, []);

  const handleSubmit = React.useCallback(
    async function () {
      const [email, password] = getEmailAndPassword();
      const createUserRequest = {
        email,
        password,
      };
      mutate(createUserRequest);
    },
    [getEmailAndPassword, mutate]
  );

  useEffect(() => {
    if (mutation.isSuccess) {
      const [email, password] = getEmailAndPassword();
      wrapSuccess({ email, password });
    }
  }, [getEmailAndPassword, wrapSuccess, mutation.isSuccess]);

  return (
    <form id="signup">
      <Label node={emailLabel} htmlFor="email" text="Email" />
      <Input node={emailInput} name="email" />
      <Label node={passwordLabel} htmlFor="password" text="Password" />
      <Input node={passwordInput} name="password" />
      <Button
        node={button}
        onClick={handleSubmit}
        text="Sign up"
        name="signupButton"
      />
    </form>
  );
}
