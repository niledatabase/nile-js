import * as React from 'react';
import Box from '@mui/joy/Box';
import Checkbox from '@mui/joy/Checkbox';
import List from '@mui/joy/List';
import { Controller, useFormContext } from 'react-hook-form';
import Stack from '@mui/joy/Stack';
import FormLabel from '@mui/joy/FormLabel';
import ListItem from '@mui/joy/ListItem';
import Typography from '@mui/joy/Typography';

import { Attribute, DisplayProps, Options } from '../types';

type Props = {
  attribute: Attribute;
  display: DisplayProps;
  options: Options;
  helperText: string;
};
export default function CheckGroup(props: Props) {
  const { options, attribute, display, helperText } = props;
  const { watch, control } = useFormContext();
  const currentVals = watch(attribute.name);
  const checkProps: { color?: 'danger'; id?: string } = {};
  if (helperText) {
    checkProps.color = 'danger';
  }
  return (
    <Controller
      name={attribute.name}
      rules={{ required: Boolean(attribute.required) }}
      control={control}
      render={({ field }) => {
        return (
          <Stack>
            <FormLabel htmlFor={`${field.name}`}>{display.label}</FormLabel>
            <Box
              role="group"
              aria-labelledby={attribute.name}
              sx={{
                borderRadius: 'var(--joy-radius-sm)',
                p: 0.5,
                border: helperText
                  ? '1px solid var(--joy-palette-danger-outlinedBorder)'
                  : 'none',
              }}
            >
              <List
                orientation="horizontal"
                wrap
                sx={{
                  '--List-gap': '8px',
                }}
              >
                {options.map((item) => {
                  checkProps.id = String(item.value);
                  return (
                    <ListItem key={`${item.value}-${item.label}`}>
                      <Checkbox
                        overlay={options.length > 1}
                        {...checkProps}
                        checked={currentVals.includes(item.value)}
                        disableIcon={options.length > 1}
                        variant="soft"
                        label={item.label}
                        onChange={(event) => {
                          if (attribute.allowMultiple) {
                            if (event.target.checked) {
                              if (!currentVals) {
                                field.onChange([item.value]);
                              } else {
                                field.onChange(currentVals.concat(item.value));
                              }
                            } else {
                              const remaining = currentVals.filter(
                                (val: string | number) => val !== item.value
                              );
                              if (remaining.length > 0) {
                                field.onChange(remaining);
                              } else {
                                field.onChange('');
                              }
                            }
                          } else {
                            if (event.target.checked) {
                              field.onChange(item.value);
                            } else {
                              field.onChange('');
                            }
                          }
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Box>
            <Typography
              sx={{ color: 'var(--joy-palette-danger-500)' }}
              level="body-sm"
            >
              {helperText}
            </Typography>
          </Stack>
        );
      }}
    />
  );
}
