'use client';

import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { LogOut } from 'lucide-react';

import { buttonVariants, ButtonProps } from '../../components/ui/button';
import { signOut } from '../../lib/next-auth';

const SignOutButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & {
    redirect?: boolean;
    callbackUrl?: string;
    buttonText?: string;
  }
>(
  (
    {
      callbackUrl,
      redirect,
      className,
      buttonText = 'Sign out',
      variant,
      size,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        onClick={() => {
          signOut({ callbackUrl, redirect });
        }}
        {...props}
      >
        {props.children ? (
          props.children
        ) : (
          <div className="flex flex-row gap-2 items-center">
            <LogOut />
            {buttonText}
          </div>
        )}
      </Comp>
    );
  }
);

SignOutButton.displayName = 'SignOutButton';
export default SignOutButton;
