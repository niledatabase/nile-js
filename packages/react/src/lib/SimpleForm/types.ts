export enum AttributeType {
  Text = 'text',
  Password = 'password',
  Select = 'select',
  Number = 'number',
  Float = 'float',
  Checkbox = 'checkbox',
}
type NumberOrString = number | string;

export type Options = { label: string; value: NumberOrString }[];
export type Attribute = {
  name: string;
  type?: AttributeType;
  defaultValue?: NumberOrString;
  options?: Options;
  allowMultiple?: boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
};

export type DisplayProps = {
  key: string;
  label: string;
  placeholder: string;
  error?: boolean;
  color?: 'danger';
};
