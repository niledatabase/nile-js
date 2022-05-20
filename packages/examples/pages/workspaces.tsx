import React, { useState } from 'react';
import { useNile } from '@theniledev/react';
import { LoginInfo, User } from '@theniledev/js';
import { useQuery } from 'react-query';
import { useForm } from 'react-hook-form';
import { ComponentList } from 'components/ComponentList';

function DeveloperLoginForm(props: { setShowForm: (show: boolean) => void }) {
  const nile = useNile();
  const { setShowForm } = props;
  const { register, handleSubmit } = useForm();
  const onSubmitCreate = React.useCallback(
    async (loginInfo: LoginInfo) => {
      await nile.developers.createDeveloper({ createUserRequest: loginInfo });
      setShowForm(false);
    },
    [nile, setShowForm]
  );
  const onSubmitLogin = React.useCallback(
    async (loginInfo: LoginInfo) => {
      await nile.developers.loginDeveloper({ loginInfo });
      setShowForm(false);
    },
    [nile, setShowForm]
  );

  return (
    <>
      <h1>Developer create</h1>
      <form
        onSubmit={handleSubmit((data) => onSubmitCreate(data as LoginInfo))}
      >
        <input
          type="text"
          placeholder="Developer email"
          {...register('email')}
        />
        <input
          type="password"
          placeholder="password"
          {...register('password')}
        />
        <input type="submit" />
      </form>
      <h1>Developer login</h1>
      <form onSubmit={handleSubmit((data) => onSubmitLogin(data as LoginInfo))}>
        <input
          type="text"
          placeholder="Developer email"
          {...register('email')}
        />
        <input
          type="password"
          placeholder="password"
          {...register('password')}
        />
        <input type="submit" />
      </form>
    </>
  );
}

function Workspaces() {
  const nile = useNile();
  const { isLoading, data: user } = useQuery<unknown, unknown, User>('me', () =>
    nile.users.me()
  );

  if (isLoading) {
    return <>Loading...</>;
  }
  if (!user) {
    return <>You are not logged in</>;
  }

  return (
    <>
      <h1>Welcome to Nile, {user.email}</h1>
      Your workspace id is <strong>{user.id}</strong>
      <ComponentList />
    </>
  );
}

function WorkspacePage() {
  const nile = useNile();
  const [showForm, setShowForm] = useState(!nile.authToken);

  if (showForm) {
    return <DeveloperLoginForm setShowForm={setShowForm} />;
  }
  return <Workspaces />;
}

export default WorkspacePage;
