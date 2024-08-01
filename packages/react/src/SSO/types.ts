export type OktaProps = {
  providers?: any[];
  callbackUrl?: string;
  onSuccess?: (data: unknown, variables: unknown) => void;
  onError?: (e: Error) => void;
  allowEdit?: boolean;
};
