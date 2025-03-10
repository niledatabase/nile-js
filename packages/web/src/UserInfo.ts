import r2wc from '@r2wc/react-to-web-component';
import { UserInfo } from '@niledatabase/react';

import { BASE_INTERFACE, Props } from '../types';

const componentName = 'nile-user-info';
// r2wc converts these to kebab, but camel also works
const props: Props = {
  ...BASE_INTERFACE,
  user: 'json',
};

const Component = r2wc(UserInfo, {
  props,
});

customElements.define(componentName, Component);
