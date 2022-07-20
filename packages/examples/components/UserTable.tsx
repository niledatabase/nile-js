import React from 'react';
import { useNile } from '@theniledev/react';
import { User } from '@theniledev/js';
import { useQuery } from '@tanstack/react-query';

export function UserTable() {
  const nile = useNile();

  const {
    isLoading,
    isError,
    error,
    data: users = [],
  } = useQuery<unknown, unknown, User[]>(['nileUsers'], () =>
    nile.users.listUsers()
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError && error instanceof Error) {
    return <div>{error.message}</div>;
  }

  return (
    <>
      <h2>Users</h2>
      {users.map((user) => {
        return <div key={user.id}>{user.email}</div>;
      })}
    </>
  );
}
