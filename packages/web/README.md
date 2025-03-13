# @niledatabase/web

`@niledatabase/web` is a library that provides web components for authentication and tenant management in Nile applications. It wraps React components from `@niledatabase/react` into custom elements using `@r2wc/react-to-web-component`, making them usable in any web environment.

## Installation

```sh
npm install @niledatabase/web
```

or

```sh
yarn add @niledatabase/web
```

## Available Components

### `<nile-sign-in-form>`

A sign-in form component.

#### Props:

- `onSuccess`: function
- `onError`: function
- `beforeMutate`: function
- `buttonText`: string
- `callbackUrl`: string
- `createTenant`: string

### `<nile-sign-out-button>`

A sign-out button component.

#### Props:

- `asChild`: boolean
- `buttonText`: string
- `callbackUrl`: string
- `redirect`: boolean
- `disabled`: boolean
- `loading`: boolean
- `size`: string
- `variant`: string

### `<nile-sign-up-form>`

A sign-up form component.

#### Props:

- `onSuccess`: function
- `onError`: function
- `beforeMutate`: function
- `buttonText`: function
- `callbackUrl`: string
- `createTenant`: string

### `<nile-tenant-selector>`

A tenant selection component.

#### Props:

- `tenants`: json
- `onError`: function
- `activeTenant`: string
- `useCookie`: boolean

### `<nile-user-info>`

Displays user information.

#### Props:

- `user`: json

## Base Interface

All components share the following base props:

```ts
export const BASE_INTERFACE: Props = {
  className: 'string',
  init: 'json',
  baseUrl: 'string',
};
```

## Usage

Simply include the custom elements in your HTML or JavaScript:

```html
<nile-sign-in-form buttonText="Sign In"></nile-sign-in-form>
```

or in JavaScript:

```js
const signInForm = document.createElement('nile-sign-in-form');
signInForm.setAttribute('buttonText', 'Sign In');
document.body.appendChild(signInForm);
```
