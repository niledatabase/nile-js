import React from 'react';

import BaseSSOForm from './BaseSSOForm';
import { Props } from './types';

export default function Okta(props: Props) {
  return <BaseSSOForm {...props} providerName="Okta" />;
}
