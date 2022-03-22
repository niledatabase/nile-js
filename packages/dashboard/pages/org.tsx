import { useState } from 'react';
import { Button } from '../components/Button';
import { ComponentList } from '../components/ComponentList';
import nile from '../utilities/nile';

function Org() {
  const [users, setUsers] = useState<unknown>(null);
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
      const users = await nile.read('orgs');
      setUsers(users);
    }
  }

  if (users) {
    return (
      <>
        <form>
          <h1>🤩 InstaExpense 🤩</h1>
          <pre>{JSON.stringify(users, null, 2)}</pre>
        </form>
        <ComponentList />
      </>
    );
  }
  return (
    <>
      <form>
        <h1>🤩 InstaExpense 🤩</h1>
        <h2>Sign in</h2>
        <label htmlFor="email">Email</label>
        <br />
        <input type="text" placeholder="email" id="email"></input>
        <br />
        <label htmlFor="password">Password</label>
        <br />
        <input type="password" placeholder="password" id="password"></input>
        <br />
        <br />
        <Button onClick={handleSubmit}>show me orgs</Button>
      </form>
      <ComponentList />
    </>
  );
}

export default Org;
