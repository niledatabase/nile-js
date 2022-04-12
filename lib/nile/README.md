# @theniledev/js

## Usage

A full list of functions available to the Nile object can be found in the [source readme](./src/README.md)

```typescript
import Nile from "@theniledev/js";

const nile = Nile({ apiUrl: props.apiUrl });

// create a user
await nile
  .createUser({ email: "anon@anon.com", password: "secret" })
  .catch((error) => console.error(error));

const user = await nile.getUser({ id: 1 });
// log created user to console
console.log(user);
```

## Contributing

### Prereq

```bash
brew install yarn
```

```bash
yarn set version berry
```

### Commands

To run:

```bash
yarn build
yarn start
```

This builds to `/dist` and runs the project in watch mode so any edits you save inside `src` causes a rebuild to `/dist`.

To do a one-off build, use `npm run build` or `yarn build`.

To run tests, use `npm test` or `yarn test`.

### Configuration

Code quality is set up for you with `prettier`, `husky`, and `lint-staged`. Adjust the respective fields in `package.json` accordingly.

#### Tests

Tests are set up to run with `yarn test`.
