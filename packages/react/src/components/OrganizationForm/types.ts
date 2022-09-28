import { Organization } from '@theniledev/js';

type OrgCreateSuccess = (org: Organization) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AllowedAny = any;

export interface Props {
  beforeMutate?: (data: AllowedAny) => AllowedAny;
  onSuccess: OrgCreateSuccess;
  onError?: (error: Error) => void;
  cancelLink?: string;
}
