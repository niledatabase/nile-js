'use client';

import React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '../../lib/utils';
import { buttonVariants, ButtonProps } from '../../components/ui/button';
import { signIn } from '../../lib/auth/Authorizer';

const XSignInButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & {
    callbackUrl?: string;
    buttonText?: string;
    init?: RequestInit;
  }
>(
  (
    {
      callbackUrl,
      className,
      buttonText = 'Continue with X',
      variant,
      size,
      init,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          'bg-black hover:bg-slate-800 pl-[3px] text-white gap-4 transition-colors shadow-md'
        )}
        ref={ref}
        onClick={() => {
          signIn('twitter', { callbackUrl, init });
        }}
        {...props}
      >
        <Icon />
        {buttonText}
      </Comp>
    );
  }
);

XSignInButton.displayName = 'XSignInButton';
export default XSignInButton;

const Icon = () => {
  return (
    <svg className="w-5 h-5 ml-3" viewBox="0 0 24 24" version="1.1">
      <path
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        fill="#ffffff"
      />
    </svg>
  );
};
