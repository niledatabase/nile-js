'use client';

import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { signIn } from '@niledatabase/client';

import { cn } from '../../lib/utils';
import { buttonVariants, ButtonProps } from '../../components/ui/button';
import { SSOButtonProps } from '../types';

const LinkedInSignInButton = ({
  callbackUrl,
  className,
  buttonText = 'Continue with LinkedIn',
  variant,
  size,
  asChild = false,
  init,
  auth,
  fetchUrl,
  baseUrl,
  onClick,
  ...props
}: ButtonProps & SSOButtonProps) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      data-slot="linkedin-button"
      className={cn(
        buttonVariants({ variant, size, className }),
        'bg-[#0288D1] hover:bg-[#0288D1] pl-[3px] hover:bg-opacity-85 gap-4 transition-colors shadow-md text-white'
      )}
      onClick={async (e) => {
        const res = await signIn('linkedin', {
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
      <Icon />
      {buttonText}
    </Comp>
  );
};

LinkedInSignInButton.displayName = 'LinkedInSignInButton';
export default LinkedInSignInButton;

const Icon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className="w-6 h-6 ml-3"
    >
      <path
        fill="#fff"
        d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"
      />
      <path
        fill="#0288D1"
        d="M12 19H17V36H12zM14.485 17h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99C24.957 25.543 25 26.511 25 27v9h-5V19h5v2.616C25.721 20.5 26.85 19 29.738 19c3.578 0 6.261 2.25 6.261 7.274L36 36 36 36z"
      />
    </svg>
  );
};
