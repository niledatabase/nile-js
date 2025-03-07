'use client';

import React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { signIn } from '../../lib/auth';
import { cn } from '../../lib/utils';
import { buttonVariants, ButtonProps } from '../../components/ui/button';

const AzureSignInButton = React.forwardRef<
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
      buttonText = 'Continue with Microsoft',
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
          'bg-[#0078d4] hover:bg-[#0078d4] hover:bg-opacity-85 pl-[3px] text-white gap-4 transition-colors shadow-md'
        )}
        ref={ref}
        onClick={() => {
          signIn('azure-ad', { callbackUrl, init });
        }}
        {...props}
      >
        <MicrosoftIcon />
        {buttonText}
      </Comp>
    );
  }
);

AzureSignInButton.displayName = 'AzureSignInButton';
export default AzureSignInButton;

const MicrosoftIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 23 23"
      className="w-5 h-5 ml-3"
    >
      <path fill="#f3f3f3" d="M0 0h23v23H0z" />
      <path fill="#f35325" d="M1 1h10v10H1z" />
      <path fill="#81bc06" d="M12 1h10v10H12z" />
      <path fill="#05a6f0" d="M1 12h10v10H1z" />
      <path fill="#ffba08" d="M12 12h10v10H12z" />
    </svg>
  );
};
