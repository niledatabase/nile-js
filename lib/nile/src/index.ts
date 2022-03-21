function Nile() {
  // nothing
}
type NileSignIn = { userInput: string };
type NileSignInMethods = { handleSignInSubmit: () => void };

Nile.signIn = ({ userInput }: NileSignIn): NileSignInMethods => {
  console.log(userInput);
  return {
    handleSignInSubmit: () => {
      console.log('something');
    },
  };
};
export { Nile };
