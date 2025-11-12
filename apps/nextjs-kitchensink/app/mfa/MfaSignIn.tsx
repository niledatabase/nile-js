"use client";
import { SignInForm } from "@niledatabase/react";
import { useRouter } from "next/navigation";

export default function MfaSignIn() {
  const { push } = useRouter();
  return (
    <SignInForm
      callbackUrl="/mfa/prompt"
      onSuccess={(payload) => {
        if (payload.status === 401) {
          const params = new URLSearchParams(payload.data);
          // push(`/mfa/prompt?${params.toString()}`);
        }
      }}
      onError={(err, data) => {
        console.log("wtf?", err, data);
      }}
    />
  );
}
