import { SSOProvider } from '@niledatabase/browser';

export type OktaProps = {
  providers: SSOProvider[];
  callbackUrl: string;
  onSuccess?: (data: unknown, variables: unknown) => void;
  onError?: (e: Error) => void;
  allowEdit?: boolean;
};
