'use client';

import { signIn } from 'next-auth/react';
import React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '../../lib/utils';
import { buttonVariants, ButtonProps } from '../../components/ui/button';

const DiscordSignInButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { callbackUrl?: string; buttonText?: string }
>(
  (
    {
      callbackUrl,
      className,
      buttonText = 'Continue with Discord',
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
        className={cn(
          buttonVariants({ variant, size, className }),
          'bg-[#5865F2] hover:bg-[#5865F2] hover:bg-opacity-85 pl-[3px] gap-4 transition-colors border shadow-md text-white'
        )}
        ref={ref}
        onClick={() => {
          signIn('discord', { callbackUrl });
        }}
        {...props}
      >
        <Icon />
        {buttonText}
      </Comp>
    );
  }
);

DiscordSignInButton.displayName = 'DiscordSignInButton';
export default DiscordSignInButton;

const Icon = () => {
  return (
    <svg
      className="w-5 h-5 ml-3"
      viewBox="0 0 75 59"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>discord-icon</title>
      <g
        id="Page-1"
        stroke="none"
        strokeWidth="1"
        fill="none"
        fillRule="evenodd"
      >
        <g
          id="discord-icon"
          transform="translate(2.000000, 2.411745)"
          fillRule="nonzero"
          stroke="#636262"
          strokeWidth="0"
        >
          <path
            d="M60.1044999,4.48605546 C55.5791999,2.40965546 50.7264999,0.879855461 45.6526999,0.00367546142 C45.5602999,-0.0132345386 45.4679999,0.0290244614 45.4203999,0.113544461 C44.7962999,1.22355546 44.1049999,2.67165546 43.6208999,3.80985546 C38.1636999,2.99285546 32.7344999,2.99285546 27.3891999,3.80985546 C26.9049999,2.64635546 26.1885999,1.22355546 25.5616999,0.113544461 C25.5140999,0.0318444614 25.4217999,-0.0104145386 25.3293999,0.00367546142 C20.2583999,0.877055461 15.4056999,2.40685546 10.8775999,4.48605546 C10.8383999,4.50295546 10.8047999,4.53115546 10.7824999,4.56775546 C1.57794989,18.3191555 -0.94356111,31.7325555 0.29340789,44.9796555 C0.29900489,45.0444555 0.33538589,45.1064555 0.38576089,45.1458555 C6.45865989,49.6056555 12.3412999,52.3131555 18.1146999,54.1077555 C18.2070999,54.1359555 18.3049999,54.1021555 18.3637999,54.0260555 C19.7294999,52.1610555 20.9468999,50.1945555 21.9906999,48.1265555 C22.0522999,48.0054555 21.9934999,47.8617555 21.8675999,47.8138555 C19.9365999,47.0813555 18.0978999,46.1882555 16.3291999,45.1740555 C16.1892999,45.0923555 16.1780999,44.8922555 16.3067999,44.7964555 C16.6789999,44.5175555 17.0512999,44.2273555 17.4066999,43.9343555 C17.4709999,43.8808555 17.5605999,43.8695555 17.6361999,43.9033555 C29.2557999,49.2084555 41.8353999,49.2084555 53.3178999,43.9033555 C53.3934999,43.8667555 53.4830999,43.8780555 53.5501999,43.9315555 C53.9056999,44.2245555 54.2778999,44.5175555 54.6528999,44.7964555 C54.7815999,44.8922555 54.7731999,45.0923555 54.6332999,45.1740555 C52.8645999,46.2079555 51.0258999,47.0813555 49.0920999,47.8110555 C48.9661999,47.8589555 48.9101999,48.0054555 48.9717999,48.1265555 C50.0379999,50.1916555 51.2553999,52.1581555 52.5958999,54.0232555 C52.6518999,54.1021555 52.7525999,54.1359555 52.8449999,54.1077555 C58.6463999,52.3131555 64.5289999,49.6056555 70.6018999,45.1458555 C70.6550999,45.1064555 70.6886999,45.0472555 70.6942999,44.9824555 C72.1746999,29.6673555 68.2146999,16.3639555 60.1967999,4.57055546 C60.1771999,4.53115546 60.1436999,4.50295546 60.1044999,4.48605546 Z M23.7258999,36.9135555 C20.2275999,36.9135555 17.3450999,33.7018555 17.3450999,29.7575555 C17.3450999,25.8132555 20.1716999,22.6015555 23.7258999,22.6015555 C27.3079999,22.6015555 30.1625999,25.8414555 30.1065999,29.7575555 C30.1065999,33.7018555 27.2799999,36.9135555 23.7258999,36.9135555 Z M47.3177999,36.9135555 C43.8195999,36.9135555 40.9370999,33.7018555 40.9370999,29.7575555 C40.9370999,25.8132555 43.7635999,22.6015555 47.3177999,22.6015555 C50.8999999,22.6015555 53.7544999,25.8414555 53.6985999,29.7575555 C53.6985999,33.7018555 50.8999999,36.9135555 47.3177999,36.9135555 Z"
            id="Shape"
            fill="white"
          />
        </g>
      </g>
    </svg>
  );
};