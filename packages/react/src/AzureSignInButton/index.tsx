'use client';

import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { signIn } from '@niledatabase/client';

import { cn } from '../../lib/utils';
import { buttonVariants, ButtonProps } from '../../components/ui/button';
import { SSOButtonProps } from '../types';

const AzureSignInButton = ({
  callbackUrl,
  className,
  buttonText = 'Continue with Microsoft',
  variant,
  size,
  init,
  asChild = false,
  auth,
  fetchUrl,
  baseUrl,
  onClick,
  ...props
}: ButtonProps & SSOButtonProps) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      data-slot="azure-button"
      className={cn(
        buttonVariants({ variant, size, className }),
        'bg-[#0078d4] hover:bg-[#0078d4] hover:bg-opacity-85 pl-[3px] text-white gap-4 transition-colors shadow-md'
      )}
      onClick={async (e) => {
        const res = await signIn('azure-ad', {
          callbackUrl,
          init,
          auth,
          fetchUrl,
          baseUrl,
        });
        onClick && onClick(e, res);
      }}
      {...props}
    >
      <MicrosoftIcon />
      {buttonText}
    </Comp>
  );
};

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
