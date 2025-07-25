'use client';

import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { signIn } from '@niledatabase/client';

import { cn } from '../../lib/utils';
import { buttonVariants, ButtonProps } from '../../components/ui/button';
import { SSOButtonProps } from '../types';

const HubSpotSignInButton = ({
  callbackUrl,
  className,
  buttonText = 'Continue with HubSpot',
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
      data-slot="hubspot-button"
      className={cn(
        buttonVariants({ variant, size, className }),
        'bg-[#ff7a59] hover:bg-[#ff7a59] hover:bg-opacity-85 pl-[3px] text-white gap-4 transition-colors shadow-md'
      )}
      onClick={async (e) => {
        const res = await signIn('hubspot', {
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

HubSpotSignInButton.displayName = 'HubSpotSignInButton';
export default HubSpotSignInButton;

const Icon = () => {
  return (
    <svg
      className="w-5 h-5 ml-3"
      viewBox="6.20856283 .64498824 244.26943717 251.24701176"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m191.385 85.694v-29.506a22.722 22.722 0 0 0 13.101-20.48v-.677c0-12.549-10.173-22.722-22.721-22.722h-.678c-12.549 0-22.722 10.173-22.722 22.722v.677a22.722 22.722 0 0 0 13.101 20.48v29.506a64.342 64.342 0 0 0 -30.594 13.47l-80.922-63.03c.577-2.083.878-4.225.912-6.375a25.6 25.6 0 1 0 -25.633 25.55 25.323 25.323 0 0 0 12.607-3.43l79.685 62.007c-14.65 22.131-14.258 50.974.987 72.7l-24.236 24.243c-1.96-.626-4-.959-6.057-.987-11.607.01-21.01 9.423-21.007 21.03.003 11.606 9.412 21.014 21.018 21.017 11.607.003 21.02-9.4 21.03-21.007a20.747 20.747 0 0 0 -.988-6.056l23.976-23.985c21.423 16.492 50.846 17.913 73.759 3.562 22.912-14.352 34.475-41.446 28.985-67.918-5.49-26.473-26.873-46.734-53.603-50.792m-9.938 97.044a33.17 33.17 0 1 1 0-66.316c17.85.625 32 15.272 32.01 33.134.008 17.86-14.127 32.522-31.977 33.165"
        fill="white"
      />
    </svg>
  );
};
