import type { Metadata } from 'next';
import { MultiFactorChallenge } from '@niledatabase/react';

export const metadata: Metadata = {
  title: 'Verify MFA challenge',
};

type PromptSearchParams = Partial<
  Record<'token' | 'scope' | 'method' | 'destination', string | string[]>
>;

type PromptPageProps = {
  searchParams?: Promise<PromptSearchParams>;
};

const takeFirst = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const getScope = (value?: string | string[]) => {
  const resolved = takeFirst(value);
  return resolved === 'setup' || resolved === 'challenge'
    ? resolved
    : undefined;
};

const getMethod = (value?: string | string[]) => {
  const resolved = takeFirst(value);
  return resolved === 'email' || resolved === 'authenticator'
    ? resolved
    : undefined;
};

export default async function MfaPromptPage({ searchParams }: PromptPageProps) {
  const sp = searchParams ? await searchParams : undefined;
  const token = takeFirst(sp?.token) ?? '';
  const scope = getScope(sp?.scope);
  const method = getMethod(sp?.method);
  const destination = takeFirst(sp?.destination);
  let methodDescription = 'second factor';
  if (method === 'email') {
    methodDescription = 'email';
  } else if (method === 'authenticator') {
    methodDescription = 'authenticator app';
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-6 py-16">
      <div className="w-full space-y-8 rounded-xl border border-border/60 bg-card p-10 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Verify it&apos;s you
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code from your {methodDescription}
            {destination ? ` sent to ${destination}` : ''}.
          </p>
        </div>
        {scope && method ? (
          <MultiFactorChallenge payload={{ token, scope, method }} />
        ) : (
          'Unable to verify, scope or method is missing'
        )}
      </div>
    </div>
  );
}
