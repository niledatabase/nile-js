import { PasswordResetRequestForm } from '@niledatabase/react';

import ForgotPasswordServer from './serverForgotPassword';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Code from '@/components/ui/code';

export default async function ForgotPassword() {
  return (
    <div className="container mx-auto p-10 flex flex-col gap-2">
      <div className="text-7xl">Forgot password</div>
      <div>
        Forgot password is more complicated, because you can no longer assume
        that a user is logged in (in fact, we must assume they are malicious)
      </div>
      <div>
        Because of that, we *must* send an email to the user, so SMTP (mailgun,
        sendgrid, etc) shall (thanks legalese) be configured in order for that
        to work. As a warning, submitting the values in this form maybe sends
        emails. Maybe it does not. At the time of writing, it sure does, but who
        knows when you&apos;re reading this.
      </div>
      <div>We do the same thing here. Once with routes, and once without</div>
      <Tabs defaultValue="server">
        <TabsList className="w-full">
          <TabsTrigger value="client">Client</TabsTrigger>
          <TabsTrigger value="server">Server</TabsTrigger>
        </TabsList>
        <TabsContent value="client">
          <PasswordResetRequestForm />
          <Code file="app/forgot-password/resetFormRequest.tsx" />
        </TabsContent>
        <TabsContent value="server">
          <ForgotPasswordServer />
          <div className="flex flex-row justify-between">
            <Code file="app/forgot-password/serverForgotPassword.tsx" />
            <Code file="app/forgot-password/forgotForm.tsx" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
