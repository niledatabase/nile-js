import { Nile } from "@nile/js";
import { Button } from "../components/Button";
function SignIn() {
  const signin = Nile.signIn({ userInput: "user" });
  const { handleSignInSubmit } = signin;
  return (
    <form name="signin">
      <input type="text" placeholder="username" id="user"></input>
      <input type="password" placeholder="password" id="password"></input>
      <Button onClick={handleSignInSubmit}>submit</Button>
    </form>
  );
}

export default SignIn;
