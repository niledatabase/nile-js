import type { Metadata } from "next";
import { SignInForm, SignUpForm, useSession } from "@niledatabase/react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { nile } from "../api/[...nile]/nile";
import EnrollMfa from "./EnrollMfa";
import MfaSignIn from "./MfaSignIn";
import { User } from "@niledatabase/server";

const isMfaMethod = (value: unknown): value is "authenticator" | "email" =>
  value === "authenticator" || value === "email";

export const metadata: Metadata = {
  title: "Sign in | Multi-factor authentication",
};

export default async function MfaPage() {
  const me = await nile.users.getSelf<User>();
  const unauthorized = me instanceof Response;
  return (
    <div className="mx-auto flex min-h-screen w-full flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="space-y-2 text-center">
        <div>Step 1: Sign up as a new user</div>
        <div>Step 2: Enroll in MFA</div>
        <div>Step 3: Sign in using MFA</div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Access your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose sign in or sign up. After signing in you&apos;ll be prompted to
          verify with your second factor.
        </p>
      </div>
      <Tabs
        className="w-full rounded-xl border border-border/60 bg-card p-10 shadow-sm"
        defaultValue="sign-up"
      >
        <TabsList className="w-full">
          <TabsTrigger value="sign-up">Sign up</TabsTrigger>
          <TabsTrigger value="mfa">Enroll in MFA</TabsTrigger>
          <TabsTrigger value="sign-in">Sign in using MFA</TabsTrigger>
        </TabsList>
        <TabsContent value="sign-up" className="mt-6">
          <SignUpForm />
        </TabsContent>
        <TabsContent value="mfa" className="mt-6">
          {unauthorized ? (
            <div>You must be logged in to use MFA</div>
          ) : (
            <EnrollMfa
              enrolled={Boolean(me.multiFactor)}
              enrolledMethod={
                isMfaMethod(me.multiFactor) ? me.multiFactor : null
              }
            />
          )}
        </TabsContent>

        <TabsContent value="sign-in" className="mt-6">
          <MfaSignIn />
        </TabsContent>
      </Tabs>
    </div>
  );
}
