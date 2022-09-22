export enum AttributeType {
  Text = 'text',
  Password = 'password',
  Select = 'select',
  Number = 'number',
}
export type Attribute = {
  name: string;
  type?: AttributeType;
  defaultValue?: string;
  options?: { label: string; value: string }[];
  label?: string;
  required?: boolean;
  placeholder?: string;
};
