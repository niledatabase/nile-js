'use client';

import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { LogOut } from 'lucide-react';
import { signOut } from '@niledatabase/client';

import { ComponentFetchProps } from '../../lib/utils';
import { buttonVariants, ButtonProps } from '../../components/ui/button';

type Props = ButtonProps &
  ComponentFetchProps & {
    redirect?: boolean;
    callbackUrl?: string;
    buttonText?: string;
    baseUrl?: string;
    fetchUrl?: string;
    basePath?: string;
  };

const SignOutButton = ({
  callbackUrl,
  redirect,
  className,
  buttonText = 'Sign out',
  variant,
  size,
  baseUrl,
  fetchUrl,
  basePath,
  auth,
  asChild = false,
  ...props
}: Props) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      data-slot="signout-button"
      className={buttonVariants({ variant, size, className })}
      onClick={() => {
        signOut({ callbackUrl, redirect, baseUrl, auth, fetchUrl, basePath });
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
};

SignOutButton.displayName = 'SignOutButton';
export default SignOutButton;
