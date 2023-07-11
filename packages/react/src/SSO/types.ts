import { GetSSOProviders200Response } from '@theniledev/browser';

export type OktaProps = {
  config?: GetSSOProviders200Response;
  onSuccess?: (data: unknown, variables: unknown) => void;
  onError?: (e: Error) => void;
  allowEdit?: boolean;
};
