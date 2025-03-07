import r2wc from '@r2wc/react-to-web-component';
import { SignUpForm } from '@niledatabase/react';

import { BASE_INTERFACE, Props } from '../types';

const componentName = 'nile-sign-up-form';
// r2wc converts these to kebab, but camel also works
const props: Props = {
  ...BASE_INTERFACE,
  onSuccess: 'function',
  onError: 'function',
  beforeMutate: 'function',
  buttonText: 'function',
  callbackUrl: 'string',
  createTenant: 'string',
};

const Component = r2wc(SignUpForm, {
  props,
});

customElements.define(componentName, Component);
