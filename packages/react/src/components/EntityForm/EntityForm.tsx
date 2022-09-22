import React from 'react';

import { useNile } from '../../context';
import { useMutation } from '../../lib/queries';
import SimpleForm, { Attribute } from '../../lib/SimpleForm';

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess: (data: any) => void;
  onError?: (error: Error) => void;
  cancelLink?: string;
  fields: Attribute[];
  entityType: string;
  org: string;
};
export default function EntityForm(props: Props) {
  const nile = useNile();
  const { fields, org, entityType, cancelLink, onSuccess, onError } = props;

  const mutation = useMutation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data: any) => {
      return nile.entities.createInstance({
        org,
        type: entityType,
        body: data,
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
