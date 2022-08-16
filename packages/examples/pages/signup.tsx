import React from 'react';
import { SignUpForm } from '@theniledev/react';

import { ComponentList } from '../components/ComponentList';

function Signup() {
  return (
    <>
      <h1>🤩 InstaExpense 🤩</h1>
      <h2>Sign up</h2>
      <SignUpForm
        onSuccess={() => {
          alert('user signed up!');
        }}
      />
      <ComponentList />
    </>
  );
}

export default Signup;
