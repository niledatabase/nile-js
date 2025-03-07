import r2wc from '@r2wc/react-to-web-component';
import { SignOutButton } from '@niledatabase/react';

import { BASE_INTERFACE, Props } from '../types';

const componentName = 'nile-sign-out-button';
// r2wc converts these to kebab, but camel also works
const props: Props = {
  ...BASE_INTERFACE,
  asChild: 'boolean',
  buttonText: 'string',
  callbackUrl: 'string',
  redirect: 'boolean',
  disabled: 'boolean',
  loading: 'boolean',
  size: 'string',
  variant: 'string',
};

const Component = r2wc(SignOutButton, {
  props,
});

customElements.define(componentName, Component);
