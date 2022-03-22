import Nile from '@theniledev/nile-js';
import { Button } from '../components/Button';
import { ComponentList } from '../components/ComponentList';
const nile = new Nile({ apiUrl: 'http://localhost:8080' });

function Signup() {
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
      console.log(user);
      alert('user created!');
    }
  }

  return (
    <>
      <form>
        <h1>🤩 InstaExpense 🤩</h1>
        <h2>Sign up</h2>
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
      <ComponentList />
    </>
  );
}

export default Signup;
