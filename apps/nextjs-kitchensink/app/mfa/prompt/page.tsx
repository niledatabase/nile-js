import type { Metadata } from "next";

import MfaVerifyForm from "./verify-form";

export const metadata: Metadata = {
  title: "Verify MFA challenge",
};

type PromptPageProps = {
  searchParams?: {
    token: string;
    scope: "setup" | "challenge";
    method: "authenticator" | "email";
    destination: string;
  };
};

export default async function MfaPromptPage({ searchParams }: PromptPageProps) {
  const sp = await searchParams;
  const tokenParam = sp?.token;
  const scope = sp?.scope;
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam ?? "";
  const methodParam = sp?.method;
  const method = Array.isArray(methodParam) ? methodParam[0] : methodParam;
  const destinationParam = sp?.destination;
  const destination = Array.isArray(destinationParam)
    ? destinationParam[0]
    : destinationParam;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-6 py-16">
      <div className="w-full space-y-8 rounded-xl border border-border/60 bg-card p-10 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Verify it&apos;s you
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code from your{" "}
            {method === "email"
              ? "email"
              : method === "authenticator"
              ? "authenticator app"
              : "second factor"}
            {destination ? ` sent to ${destination}` : ""}.
          </p>
        </div>
        {scope ? (
          <MfaVerifyForm token={token} scope={scope} method={method} />
        ) : (
          "Unable to verify, scope is missing"
        )}
      </div>
    </div>
  );
}
