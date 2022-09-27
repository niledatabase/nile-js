import { Organization } from '@theniledev/js';

type OrgCreateSuccess = (org: Organization) => void;

export interface Props {
  onSuccess: OrgCreateSuccess;
  onError?: (error: Error) => void;
  cancelLink?: string;
}
