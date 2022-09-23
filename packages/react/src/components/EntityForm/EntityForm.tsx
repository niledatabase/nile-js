import React from 'react';

import { useNile } from '../../context';
import { useMutation } from '../../lib/queries';
import SimpleForm, { Attribute, AttributeType } from '../../lib/SimpleForm';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AllowedAny = any;

type Props = {
  onSuccess: (data: AllowedAny) => void;
  onError?: (error: Error) => void;
  cancelLink?: string;
  fields: Attribute[];
  entityType: string;
  org: string;
};

function setNumber(
  int: number,
  accum: { [key: string]: AllowedAny },
  data: AllowedAny,
  key: string
) {
  if (!isNaN(int)) {
    accum[key] = int;
  } else {
    // if the above fails, the BE will error out with better information
    accum[key] = data[key];
  }
}
// need to attempt to sanitize the data
export const processFormData = (data: AllowedAny, fields: Attribute[]) => {
  const body = Object.keys(data).reduce(
    (accum: { [key: string]: AllowedAny }, key: string) => {
      const field = fields.find((field) => field.name === key);
      if (field) {
        switch (field.type) {
          case AttributeType.Number: {
            const int = parseInt(data[key], 10);
            setNumber(int, accum, data, key);
            break;
          }
          case AttributeType.Float: {
            // if this fails, the BE will error out with better information
            const float = parseFloat(data[key]);
            setNumber(float, accum, data, key);
            break;
          }
          default:
            accum[key] = data[key];
        }
      }
      return accum;
    },
    {}
  );
  return body;
};

export default function EntityForm(props: Props) {
  const nile = useNile();
  const { fields, org, entityType, cancelLink, onSuccess, onError } = props;

  const mutation = useMutation(
    (data: AllowedAny) => {
      const body = processFormData(data, fields);
      return nile.entities.createInstance({
        org,
        type: entityType,
        body,
      });
    },
    {
      onSuccess: (data) => {
        onSuccess && onSuccess(data);
      },
      onError: (error) => {
        onError && onError(error as Error);
      },
    }
  );
  return (
    <SimpleForm
      attributes={fields}
      mutation={mutation}
      buttonText={`Create ${entityType}`}
      cancelLink={cancelLink}
    />
  );
}
