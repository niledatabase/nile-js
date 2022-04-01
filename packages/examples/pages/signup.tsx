import React from 'react';
import { ComponentList } from '../components/ComponentList';
import { SignUpForm, NileProvider } from '@theniledev/react';
function Signup() {
  return (
    <NileProvider apiUrl="http://localhost:8080">
      <h1>🤩 InstaExpense 🤩</h1>
      <h2>Sign up</h2>
      <SignUpForm
        handleSuccess={(user) => {
            alert(JSON.stringify(user));
        }}
      />
      <ComponentList />
    </NileProvider>
  );
}

export default Signup;
