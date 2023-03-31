import React from 'react';

import { useNile } from '../context';

import GoogleSSOButton from './Button';

type LogInGoogleProps = {
  org?: string;
};
/**
 * Basic component for a google login form
 */
export default function LogInGoogle(props: LogInGoogleProps) {
  const nile = useNile();
  const { org } = props;
  const href = React.useMemo(() => {
    if (org) {
      return nile.organizations.oidc.GOOGLE(org);
    }
    return nile.workspaces.oidc.providers.GOOGLE();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org]);

  return <GoogleSSOButton href={href} />;
}
