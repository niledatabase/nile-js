<p align="center">
  <img width="1434" alt="Screen Shot 2024-09-18 at 9 20 04 AM" src="https://github.com/user-attachments/assets/20585883-5cdc-4f15-93d3-dc150e87bc11">
</p>

---

# Nile's Web Components

This package (`@niledatabase/web`) provides web components for Nile and is part of [Nile's Javascript SDK](https://github.com/niledatabase/nile-js/tree/main).

Nile's web components include:

- 🎨 Authentication and tenant management components usable in any web environment
- ⚛️ Wrapped versions of `@niledatabase/react` components using `@r2wc/react-to-web-component`

## Installation

```sh
npm install @niledatabase/web
```

or

```sh
yarn add @niledatabase/web
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

## Learn more

- You can learn more about Nile and the SDK in [https://thenile.dev/docs]
- You can find detailed code examples in [our main repo](https://github.com/niledatabase/niledatabase)
- Nile SDK interacts with APIs in Nile Auth service. You can learn more about it in the [repository](https://github.com/niledatabase/nile-auth) and the [docs](https://thenile.dev/docs/auth)