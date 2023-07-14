export enum AttributeType {
  Text = 'text',
  Password = 'password',
  Select = 'select',
  Number = 'number',
  Float = 'float',
  Checkbox = 'checkbox',
  Switch = 'switch',
}
type NumberOrString = number | string;

// possibly no value for `<Switch/>`
export type Options = { label: string; value?: NumberOrString }[];
export type Attribute = {
  name: string;
  type?: AttributeType;
  defaultValue?: NumberOrString;
  options?: Options;
  allowMultiple?: boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  disabled?: boolean;
};

export type DisplayProps = {
  key: string;
  id: string;
  label: string;
  placeholder: string;
  error?: boolean;
  color?: 'danger';
  disabled?: boolean;
};
