'use client';
import { Slot } from '@radix-ui/react-slot';
import React from 'react';
import { Mail } from 'lucide-react';

import { ButtonProps, buttonVariants } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { signIn } from '../../lib/next-auth';

type EmailError = void | {
  error: string;
  ok: boolean;
  status: number;
  url: null | string;
};
type AllProps = ButtonProps & {
  callbackUrl?: string;
  redirect?: boolean;
  email: string;
  onSent?: () => void;
  onFailure?: (error: EmailError) => void;
  buttonText?: string;
};

/**
 * This works when the email identity provider is configured in the admin dashboard.
 * @param props callbackUrl: the url to send the user to from their email
 * @param props redirect: redirect to the default (unbranded) 'check your email' page. default is false
 * @param props email:  the email to send to
 * @param props onSent:  called if the email was sent
 * @param props onFailure:  called if there was a reportable
 * @returns a JSX.Element to render
 */

const EmailSignInButton = React.forwardRef<HTMLButtonElement, AllProps>(
  (
    {
      callbackUrl,
      className,
      variant,
      size,
      asChild = false,
      redirect = false,
      buttonText = 'Continue with Email',
      email,
      onFailure,
      onSent,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={async () => {
          const res = await signIn('email', { email, callbackUrl, redirect });

          if (res && 'error' in res) {
            onFailure && onFailure(res as EmailError);
          } else {
            onSent && onSent();
          }
        }}
        {...props}
      >
        {props.children ? (
          props.children
        ) : (
          <div className="flex flex-row gap-2 items-center">
            <Mail />
            {buttonText}
          </div>
        )}
      </Comp>
    );
  }
);

EmailSignInButton.displayName = 'EmailSignInButton';
export default EmailSignInButton;
