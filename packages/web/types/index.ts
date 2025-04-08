export type Props = Record<
  string,
  'string' | 'number' | 'boolean' | 'function' | 'json'
>;

export const BASE_INTERFACE: Props = {
  auth: 'json',
  className: 'string',
};
