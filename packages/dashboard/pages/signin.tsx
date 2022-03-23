import Nile from '@theniledev/nile-js';
import { Button } from '../components/Button';
import { ComponentList } from '../components/ComponentList';
const nile = new Nile({ apiUrl: 'http://localhost:8080' });

function SignIn() {
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
      alert('login worked!');
    }
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
        <Button onClick={handleSubmit}>Sign in</Button>
      </form>
      <ComponentList />
    </>
  );
}

export default SignIn;
