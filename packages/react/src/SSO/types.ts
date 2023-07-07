import { GetSSOProvider200Response } from '@theniledev/browser';

export type Props = {
  config?: GetSSOProvider200Response;
  onSuccess?: (data: unknown, variables: unknown) => void;
  onError?: (e: Error) => void;
  allowEdit?: boolean;
};
