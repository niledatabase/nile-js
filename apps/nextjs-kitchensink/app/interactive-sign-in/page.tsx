import { revalidatePath } from 'next/cache';

import SignInSignOut from './SignInSignOut';

import Code from '@/components/ui/code';

export default async function InteractiveSingIn() {
  return (
    <div className="mx-auto container p-10">
      This page lets you sign up or sign as random users. Sign up automatically
      creates the user and signs that user in.
      <SignInSignOut revalidate={revalidate} />
      <Code file="app/interactive-sign-in/SignInSignOut.tsx" />
    </div>
  );
}
async function revalidate() {
  'use server';
  revalidatePath('/interactive-sign-in');
}
