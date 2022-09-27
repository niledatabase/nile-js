import React from 'react';
import { CreateOrganizationRequest, Organization } from '@theniledev/js';

import { useNile } from '../../context';
import { useMutation } from '../../lib/queries';
import SimpleForm, { AttributeType } from '../../lib/SimpleForm';

import { Props } from './types';

const attributes = [
  {
    name: 'name',
    label: 'Organization name',
    type: AttributeType.Text,
    defaultValue: '',
    required: true,
  },
];

export default function AddOrgForm(props: Props) {
  const { onSuccess, onError, cancelLink } = props;
  const nile = useNile();

  const mutation = useMutation(
    (data: CreateOrganizationRequest) =>
      nile.organizations.createOrganization({
        createOrganizationRequest: data,
      }),
    {
      onSuccess: (data: Organization) => {
        onSuccess(data);
      },
      onError: (e: Error) => {
        onError && onError(e as Error);
      },
    }
  );

  return (
    <SimpleForm
      mutation={mutation}
      buttonText="Create organization"
      attributes={attributes}
      cancelLink={cancelLink}
    />
  );
}
