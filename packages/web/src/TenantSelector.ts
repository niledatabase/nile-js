import r2wc from '@r2wc/react-to-web-component';
import { TenantSelector } from '@niledatabase/react';

import { BASE_INTERFACE, Props } from '../types';

const componentName = 'nile-tenant-selector';
// r2wc converts these to kebab, but camel also works
const props: Props = {
  ...BASE_INTERFACE,
  tenants: 'json',
  onError: 'function',
  activeTenant: 'string',
  useCookie: 'boolean',
};

const Component = r2wc(TenantSelector, {
  props,
});

customElements.define(componentName, Component);
