export enum AttributeType {
  Text = 'text',
  Password = 'password',
  Select = 'select',
  Number = 'number',
  Float = 'float',
}
type NumberOrString = number | string;

export type Attribute = {
  name: string;
  type?: AttributeType;
  defaultValue?: NumberOrString;
  options?: { label: string; value: NumberOrString }[];
  label?: string;
  required?: boolean;
  placeholder?: string;
};
