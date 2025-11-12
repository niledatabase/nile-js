'use client';
import { SignInForm } from '@niledatabase/react';

export default function MfaSignIn() {
  return <SignInForm callbackUrl="/mfa/prompt" />;
}
