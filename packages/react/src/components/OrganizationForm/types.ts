import { Organization } from '@theniledev/js';
import React from 'react';

type OrgCreateSuccess = (org: Organization) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AllowedAny = any;

export interface Props {
  beforeMutate?: (data: AllowedAny) => AllowedAny;
  onSuccess: OrgCreateSuccess;
  onError?: (error: Error) => void;
  cancelButton?: React.ReactNode;
}
