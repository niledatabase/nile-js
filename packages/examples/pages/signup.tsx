import React from 'react';
import { ComponentList } from '../components/ComponentList';
import { SignUpForm } from '@theniledev/react';
function Signup() {
  return (
    <>
      <h1>🤩 InstaExpense 🤩</h1>
      <h2>Sign up</h2>
      <SignUpForm
        handleSuccess={() => {
          alert('user signed up!');
        }}
      />
      <ComponentList />
    </>
  );
}


export default Signup;
