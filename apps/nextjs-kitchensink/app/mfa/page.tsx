import type { Metadata } from 'next';
import { SignUpForm } from '@niledatabase/react';
import { User } from '@niledatabase/server';

import { nile } from '../api/[...nile]/nile';

import EnrollMfa from './EnrollMfa';
import MfaSignIn from './MfaSignIn';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const isMfaMethod = (value: unknown): value is 'authenticator' | 'email' =>
  value === 'authenticator' || value === 'email';

export const metadata: Metadata = {
  title: 'Sign in | Multi-factor authentication',
};

export default async function MfaPage() {
  const me = await nile.users.getSelf<User>();
  const unauthorized = me instanceof Response;

  return (
    <div className="mx-auto flex min-h-screen w-full flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="space-y-6 text-center">
        <MFAInstructions />
        <h1 className="text-3xl font-semibold tracking-tight">
          Access your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose sign in or sign up. After signing in you&apos;ll be prompted to
          verify with your second factor.
        </p>
      </div>
      <Tabs
        className="w-full rounded-xl border border-border/60 bg-card p-10 shadow-sm"
        defaultValue="sign-up"
      >
        <TabsList className="w-full">
          <TabsTrigger value="sign-up">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
              1
            </span>
            Sign up
          </TabsTrigger>
          <TabsTrigger value="mfa">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
              2
            </span>
            Enroll in MFA
          </TabsTrigger>
          <TabsTrigger value="sign-in">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
              3
            </span>
            Sign in
          </TabsTrigger>
        </TabsList>
        <TabsContent value="sign-up" className="mt-6">
          <SignUpForm />
        </TabsContent>
        <TabsContent value="mfa" className="mt-6">
          {unauthorized ? (
            <div>You must be logged in to use MFA</div>
          ) : (
            <EnrollMfa
              enrolled={Boolean(me.multiFactor)}
              enrolledMethod={
                isMfaMethod(me.multiFactor) ? me.multiFactor : null
              }
            />
          )}
        </TabsContent>

        <TabsContent value="sign-in" className="mt-6">
          <MfaSignIn />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MFAInstructions() {
  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-border/60 bg-muted/30 p-6 text-left shadow-inner">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Your MFA flight plan
      </p>
      <ol className="mt-4 space-y-3">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="flex items-center gap-4 rounded-2xl bg-card/80 p-4 shadow-sm"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              {index + 1}
            </span>
            <div className="flex flex-1 flex-col">
              <p className="text-base font-medium items-center flex">
                <span className="mr-2 text-2xl" aria-hidden="true">
                  {step.emoji}
                </span>
                {step.title}
              </p>
              <p className="text-sm text-muted-foreground">{step.details}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
const steps = [
  {
    title: 'Sign up as a new user',
    details: 'Create a fresh account so we can keep things secure.',
    emoji: '🆕',
  },
  {
    title: 'Enroll in MFA',
    details:
      'Pair an authenticator app or email code as your second factor, then 🚪 Log out',
    emoji: '🛡️',
  },
  {
    title: 'Sign in with MFA',
    details: 'Return and prove it’s really you with your chosen factor.',
    emoji: '✅',
  },
];
