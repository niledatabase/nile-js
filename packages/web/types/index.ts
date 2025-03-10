export type Props = Record<
  string,
  'string' | 'number' | 'boolean' | 'function' | 'json'
>;

export const BASE_INTERFACE: Props = {
  className: 'string',
  init: 'json',
  baseUrl: 'string',
};
