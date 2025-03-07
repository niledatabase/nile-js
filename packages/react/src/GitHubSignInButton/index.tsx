'use client';

import React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { signIn } from '../../lib/auth';
import { cn } from '../../lib/utils';
import { buttonVariants, ButtonProps } from '../../components/ui/button';

const GitHubSignInButton = React.forwardRef<
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
      buttonText = 'Continue with GitHub',
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
          signIn('github', { callbackUrl, init });
        }}
        {...props}
      >
        <Icon />
        {buttonText}
      </Comp>
    );
  }
);

GitHubSignInButton.displayName = 'GitHubSignInButton';
export default GitHubSignInButton;

const Icon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32.58 31.77"
      fill="currentColor"
      className="w-5 h-5 ml-3"
    >
      <path
        fill="#FFFFFF"
        d="M16.29,0a16.29,16.29,0,0,0-5.15,31.75c.82.15,1.11-.36,1.11-.79s0-1.41,0-2.77C7.7,29.18,6.74,26,6.74,26a4.36,4.36,0,0,0-1.81-2.39c-1.47-1,.12-1,.12-1a3.43,3.43,0,0,1,2.49,1.68,3.48,3.48,0,0,0,4.74,1.36,3.46,3.46,0,0,1,1-2.18c-3.62-.41-7.42-1.81-7.42-8a6.3,6.3,0,0,1,1.67-4.37,5.94,5.94,0,0,1,.16-4.31s1.37-.44,4.48,1.67a15.41,15.41,0,0,1,8.16,0c3.11-2.11,4.47-1.67,4.47-1.67A5.91,5.91,0,0,1,25,11.07a6.3,6.3,0,0,1,1.67,4.37c0,6.26-3.81,7.63-7.44,8a3.85,3.85,0,0,1,1.11,3c0,2.18,0,3.94,0,4.47s.29.94,1.12.78A16.29,16.29,0,0,0,16.29,0Z"
      />
    </svg>
  );
};
