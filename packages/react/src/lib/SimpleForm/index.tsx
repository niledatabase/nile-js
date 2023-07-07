import React from 'react';
import Button from '@mui/joy/Button';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import Stack from '@mui/joy/Stack';
import Input from '@mui/joy/Input';
import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import Error from '@mui/icons-material/Error';
import FormLabel from '@mui/joy/FormLabel';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Box from '@mui/joy/Box';
import Tooltip from '@mui/joy/Tooltip';

import CheckGroup from './CheckGroup';
import { Attribute, AttributeType, DisplayProps } from './types';

type AttrMap = { [key: string]: string | number | string[] | number[] };

type FieldConfig = {
  required?: boolean;
};

export const getAttributeDefault = (
  attribute: Attribute
): string | number | string[] | number[] => {
  // have to look to see if it is an enum
  if (attribute.allowMultiple === true) {
    if (!Array.isArray(attribute.defaultValue) && attribute.defaultValue) {
      if (typeof attribute.defaultValue === 'number') {
        return [attribute.defaultValue];
      }
      return [String(attribute.defaultValue)];
    }
  }
  return attribute.defaultValue ?? '';
};

function Labler(props: { error?: string; attr: Attribute }) {
  const { error, attr } = props;
  if (error) {
    return (
      <Tooltip title={error} color="danger" sx={{ cursor: 'pointer' }}>
        <FormLabel>
          {attr.label ?? attr.name}
          <Error color="error" sx={{ ml: 0.5 }} />
        </FormLabel>
      </Tooltip>
    );
  }
  return <FormLabel>{attr.label ?? attr.name}</FormLabel>;
}
export default function SimpleForm(props: {
  buttonText: string;
  cancelButton?: React.ReactNode;
  attributes: Attribute[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutation: { mutate: (data: any) => void };
}) {
  const { mutation, buttonText, attributes, cancelButton } = props;

  const defaultValues = React.useMemo(
    () =>
      attributes.reduce((accum: AttrMap, attr: Attribute) => {
        accum[attr.name] = getAttributeDefault(attr);
        return accum;
      }, {}),
    [attributes]
  );

  const methods = useForm({
    defaultValues,
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = methods;
  const onSubmit = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data: any) => {
      mutation.mutate(data);
    },
    [mutation]
  );

  return (
    <FormProvider {...methods}>
      <Stack
        component="form"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSubmit={handleSubmit((data) => onSubmit(data as any))}
        spacing={2}
      >
        {attributes.map((attr: Attribute): React.ReactNode => {
          const fieldConfig: FieldConfig = {};
          const display: DisplayProps = {
            key: attr.name,
            label: attr.label ?? attr.name,
            id: attr.label ?? attr.name,
            placeholder: attr.placeholder ?? attr.label ?? attr.name,
            error: Boolean(errors[attr.name]),
            disabled: Boolean(attr.disabled),
          };
          const options = attr.options ?? [];
          const helperText = attr.helpText ?? '';
          let error = '';

          if (attr.required) {
            error = errors[attr.name]
              ? `${attr.label ?? attr.name} is required`
              : '';
            fieldConfig.required = true;
          }

          switch (attr.type) {
            case AttributeType.Checkbox:
              return (
                <CheckGroup
                  key={display.key}
                  attribute={attr}
                  display={display}
                  options={options}
                  helperText={helperText}
                />
              );
            case AttributeType.Select:
              return (
                <FormControl key={display.key} id={display.id}>
                  <Labler error={error} attr={attr} />
                  <Controller
                    control={control}
                    rules={{ required: Boolean(attr.required) }}
                    name={attr.name}
                    render={({ field }) => {
                      const color: { color?: 'danger' } = {};
                      if (errors[attr.name]) {
                        color.color = 'danger';
                      }
                      return (
                        <Stack>
                          <Select
                            id={`select-field-${attr.name}`}
                            placeholder={`${display.placeholder}...`}
                            {...color}
                            {...field}
                            onChange={(_, newValue) => {
                              field.onChange(newValue);
                            }}
                          >
                            {options.map((option) => {
                              return (
                                <Option key={option.value} value={option.value}>
                                  {option.label}
                                </Option>
                              );
                            })}
                          </Select>
                          <FormHelperText id={`${attr.name}-helper-text`}>
                            {helperText}
                          </FormHelperText>
                        </Stack>
                      );
                    }}
                  />
                </FormControl>
              );
            case AttributeType.Password:
              return (
                <FormControl key={display.key} id={display.id}>
                  <Labler error={error} attr={attr} />
                  <Input
                    {...display}
                    {...register(attr.name, fieldConfig)}
                    type={AttributeType.Password}
                  />
                  <FormHelperText id={`${attr.name}-helper-text`}>
                    {helperText}
                  </FormHelperText>
                </FormControl>
              );
            case AttributeType.Number:
              return (
                <FormControl key={display.key} id={display.id}>
                  <Labler error={error} attr={attr} />
                  <Input
                    {...display}
                    {...register(attr.name, fieldConfig)}
                    type={AttributeType.Number}
                  />
                  <FormHelperText id={`${attr.name}-helper-text`}>
                    {helperText}
                  </FormHelperText>
                </FormControl>
              );

            case AttributeType.Text:
            default:
              return (
                <FormControl key={display.key} id={display.id}>
                  <Labler error={error} attr={attr} />
                  <Input {...display} {...register(attr.name, fieldConfig)} />
                  <FormHelperText id={`${attr.name}-helper-text`}>
                    {helperText}
                  </FormHelperText>
                </FormControl>
              );
          }
        })}
        {cancelButton ? (
          <Stack spacing={2} direction="row">
            {cancelButton}
            <Box>
              <Button type="submit">{buttonText}</Button>
            </Box>
          </Stack>
        ) : (
          <Box>
            <Button type="submit">{buttonText}</Button>
          </Box>
        )}
      </Stack>
    </FormProvider>
  );
}
