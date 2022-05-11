import React from 'react';

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
    handleFailure,
  } = props;
  const nile = useNile();

  const handleSubmit = React.useCallback(
    async function () {
      const email = document.querySelector(
        '#signup #email'
      ) as HTMLInputElement;
      const password = document.querySelector(
        '#signup #password'
      ) as HTMLInputElement;

      const createUserRequest = {
        email: email.value,
        password: password.value,
      };

      await nile.createUser({ createUserRequest }).catch((e: Error) => {
        handleFailure && handleFailure(e);
      });
      handleSuccess && handleSuccess(createUserRequest);
    },
    [handleFailure, handleSuccess, nile]
  );

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
