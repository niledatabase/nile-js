import React from 'react';
import { CreateOrganizationRequest, Organization } from '@theniledev/js';

import { useNile } from '../../context';
import { useMutation } from '../../lib/queries';
import SimpleForm, { AttributeType } from '../../lib/SimpleForm';

import { AllowedAny, Props } from './types';

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
  const { onSuccess, onError, cancelLink, beforeMutate } = props;
  const nile = useNile();
  const handleMutate =
    typeof beforeMutate === 'function'
      ? beforeMutate
      : (data: AllowedAny): AllowedAny => data;

  const mutation = useMutation(
    (data: CreateOrganizationRequest) =>
      nile.organizations.createOrganization({
        createOrganizationRequest: handleMutate(data),
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
