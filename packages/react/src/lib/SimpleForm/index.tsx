import React from 'react';
import TextField from '@mui/joy/TextField';
import Button from '@mui/joy/Button';
import { Controller, useForm } from 'react-hook-form';
import Stack from '@mui/joy/Stack';
import { Select, Option, FormLabel, Link, Box, Typography } from '@mui/joy';

import { Attribute, AttributeType } from './types';

export { AttributeType, Attribute } from './types';

type AttrMap = { [key: string]: string | number };
type DisplayProps = {
  key: string;
  label: string;
  placeholder: string;
  helperText?: string;
  error?: boolean;
  color?: 'danger';
};
type FieldConfig = {
  required?: boolean;
};

export default function ConfigForm(props: {
  buttonText: string;
  cancelLink?: string;
  attributes: Attribute[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutation: { mutate: (data: any) => void };
}) {
  const { mutation, buttonText, attributes, cancelLink } = props;

  const defaultValues = React.useMemo(
    () =>
      attributes.reduce((accum: AttrMap, attr: Attribute) => {
        accum[attr.name] = attr.defaultValue ?? '';
        return accum;
      }, {}),
    [attributes]
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const onSubmit = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data: any) => {
      mutation.mutate(data);
    },
    [mutation]
  );

  return (
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
          placeholder: attr.placeholder ?? attr.label ?? attr.name,
          error: Boolean(errors[attr.name]),
        };

        const options = attr.options ?? [];

        if (attr.required) {
          display.helperText = errors[attr.name] && 'This field is required';
          fieldConfig.required = true;
        }

        switch (attr.type) {
          case AttributeType.Select:
            return (
              <Stack key={display.key}>
                <FormLabel htmlFor={`select-field-${attr.name}`}>
                  {display.label}
                </FormLabel>
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
                          onChange={(e) => {
                            const target = e?.target as HTMLElement;
                            if (target) {
                              const option = options.find(
                                ({ label }) => label === target.innerText
                              );
                              if (option) {
                                field.onChange(option.value);
                              }
                            }
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
                        <Typography
                          sx={{ color: 'var(--joy-palette-danger-500)' }}
                          level="body2"
                        >
                          {display.helperText}
                        </Typography>
                      </Stack>
                    );
                  }}
                />
              </Stack>
            );
          case AttributeType.Password:
            return (
              <TextField
                {...display}
                {...register(attr.name, fieldConfig)}
                type={AttributeType.Password}
              />
            );
          case AttributeType.Number:
            return (
              <TextField
                {...display}
                {...register(attr.name, fieldConfig)}
                type={AttributeType.Number}
              />
            );

          case AttributeType.Text:
          default:
            return (
              <TextField {...display} {...register(attr.name, fieldConfig)} />
            );
        }
      })}
      {cancelLink ? (
        <Stack spacing={2} direction="row">
          <Link href={cancelLink}>
            <Button variant="outlined">Cancel</Button>
          </Link>
          <Box>
            <Button type="submit">{buttonText}</Button>
          </Box>
        </Stack>
      ) : (
        <Button type="submit">{buttonText}</Button>
      )}
    </Stack>
  );
}
