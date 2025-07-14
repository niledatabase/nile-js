import { Google, LinkedIn, SignInForm, SignUpForm } from '@niledatabase/react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const dynamic = 'force-dynamic';

export default async function Home() {
  return (
    <div className="flex-1 flex justify-center flex-col">
      <div className="text-7xl m-40 text-center">The Kitchen Sink</div>
      <div className="flex flex-col gap-10 max-w-2xl container mx-auto">
        <div className="flex flex-col gap-2 items-center">
          <div>
            <Google callbackUrl="/google" />
          </div>
          <div>
            <LinkedIn />
          </div>
        </div>
        <div className="flex flex-row gap-10 items-center">
          <hr className="w-full" />
          or
          <hr className="w-full" />
        </div>
        <Tabs defaultValue="signup">
          <TabsList className="w-full">
            <TabsTrigger value="signup">Sign up</TabsTrigger>
            <TabsTrigger value="signin">Sign In</TabsTrigger>
          </TabsList>
          <TabsContent value="signup">
            <SignUpForm callbackUrl="/dashboard" />
          </TabsContent>
          <TabsContent value="signin">
            <SignInForm callbackUrl="/dashboard" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
