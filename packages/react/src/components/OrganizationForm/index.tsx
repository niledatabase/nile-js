import React from 'react';
import { CreateOrganizationRequest, Organization } from '@theniledev/js';
import { useMutation } from '@tanstack/react-query';

import { useNile } from '../../context';
import { AttributeType } from '../../lib/SimpleForm/types';
import SimpleForm from '../../lib/SimpleForm';

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
  const { onSuccess, onError, cancelButton, beforeMutate } = props;
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
      cancelButton={cancelButton}
    />
  );
}
