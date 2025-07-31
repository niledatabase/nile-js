import { UserInfo } from '@niledatabase/react';

import GoogleManualButton from './loginButton';

import Code from '@/components/ui/code';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function GoogleManual({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  return (
    <div className="container mx-auto pt-40 px-10">
      <div className="flex flex-col gap-10">
        <div className="text-7xl">Custom Google SSO implementation</div>
        {(await searchParams).success ? <UserInfo /> : null}
        <div>
          On this page, we are going to walk through the steps to log a user in
          via google SSO without a framework. Normally you would this up using
          routes, but maybe you need full control (or are doing something fully
          custom). We will highlight two ways to do this. One is via an API we
          make that wraps nile-auth, and the other will be though a server
          action, which most frameworks support
        </div>
        <h3 className="text-4xl">API Wrapping</h3>
        <div>
          To start, make some kind of BE files that will respond with the
          request to sign in. We want to be sure that 1. the provider we want to
          call is available 2. the CSRF token is ready to be sent 3. We can
          respond to a sign in route 4. We handle the callback from the provider
          To accomplish this, we add the required files:
          <Tabs defaultValue="sso">
            <TabsList className="w-full">
              <TabsTrigger value="sso">
                app/google-manual/sso/route.ts
              </TabsTrigger>
              <TabsTrigger value="csrf">
                app/google-manual/csrf/route.ts
              </TabsTrigger>
              <TabsTrigger value="providers">
                app/google-manual/csrf/providers.ts
              </TabsTrigger>
              <TabsTrigger value="callback">
                app/google-manual/[...callback].ts
              </TabsTrigger>
            </TabsList>
            <TabsContent value="sso">
              <Code file="app/google-manual/sso/route.ts" noTitle />
            </TabsContent>
            <TabsContent value="csrf">
              <Code file="app/google-manual/csrf/route.ts" noTitle />
            </TabsContent>
            <TabsContent value="providers">
              <Code file="app/google-manual/providers/route.ts" noTitle />
            </TabsContent>
            <TabsContent value="callback">
              Because the callback endpoint always requires a provider to be
              responded against, but for the example we will only support
              google, we are simply taking all responses from `nile-auth` and
              doing a google sso sign in. In addition, the callback route needs
              to pass all of the parameters from the SSO attempt so that
              nile-auth can use them to create a session.
              <Code file="app/google-manual/[...callback]/route.ts" noTitle />
            </TabsContent>
          </Tabs>
        </div>

        <div>
          You may have noticed a `localizedNile` file is imported here. Because
          this exists inside of a project that has the defaults for Nile
          configured, we had to create a special new instance to handle the
          specifics of this example. By setting the `routePrefix`, we tell both
          the SDK and nile-auth this is where our application lives, so act
          accordingly.
          <Code file="app/google-manual/localizedNile.ts" />
        </div>
        <div>
          Now we load the button in the UI, so we can hit our endpoint to start
          the SSO handshake. We want to set the URL back to the route we created
          in order to pass a valid token back.
          <Code file="app/google-manual/loginButton.tsx" />
          With that set up, we should be able to sign in with google without
          using any routes.
          <div className="flex justify-center p-30">
            <GoogleManualButton />
          </div>
        </div>
      </div>
    </div>
  );
}
