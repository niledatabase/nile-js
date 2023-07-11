import React from 'react';

import BaseSSOForm from './BaseSSOForm';
import { OktaProps } from './types';

export default function Okta(props: OktaProps) {
  return <BaseSSOForm {...props} providerName="Okta" />;
}
