"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { mfa } from "@niledatabase/client";
import QRCode from "react-qr-code";
import { Copy, Download } from "lucide-react";
import MfaVerifyForm from "./prompt/verify-form";

type MfaMethod = "authenticator" | "email";
type ChallengeScope = "setup" | "challenge";

type AuthenticatorSetup = {
  method: "authenticator";
  token: string;
  scope: ChallengeScope;
  otpauthUrl?: string;
  secret?: string;
  recoveryKeys?: string[];
};

type EmailSetup = {
  method: "email";
  token: string;
  scope: ChallengeScope;
  maskedEmail?: string;
};

type CopyState = "idle" | "copied" | "error";

type EnrollMfaProps = {
  enrolled?: boolean;
  enrolledMethod?: MfaMethod | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isScope = (value: unknown): value is ChallengeScope =>
  value === "setup" || value === "challenge";

const parseRecoveryKeys = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const keys = value.filter(
    (key): key is string => typeof key === "string" && key.trim().length > 0
  );

  return keys.length > 0 ? keys : undefined;
};

const parseAuthenticatorResponse = (
  value: unknown
): AuthenticatorSetup | null => {
  if (!isRecord(value) || value.method !== "authenticator") {
    return null;
  }

  if (!isScope(value.scope) || typeof value.token !== "string") {
    return null;
  }

  return {
    method: "authenticator",
    token: value.token,
    scope: value.scope,
    otpauthUrl:
      typeof value.otpauthUrl === "string" ? value.otpauthUrl : undefined,
    secret: typeof value.secret === "string" ? value.secret : undefined,
    recoveryKeys: parseRecoveryKeys(value.recoveryKeys),
  };
};

const parseEmailResponse = (value: unknown): EmailSetup | null => {
  if (!isRecord(value) || value.method !== "email") {
    return null;
  }

  if (!isScope(value.scope) || typeof value.token !== "string") {
    return null;
  }

  return {
    method: "email",
    token: value.token,
    scope: value.scope,
    maskedEmail:
      typeof value.maskedEmail === "string" &&
      value.maskedEmail.trim().length > 0
        ? value.maskedEmail
        : undefined,
  };
};

type ChallengeRedirect = {
  token: string;
  method: MfaMethod;
  scope: ChallengeScope;
  destination?: string;
};

const redirectToPrompt = (
  router: ReturnType<typeof useRouter>,
  params: ChallengeRedirect
) => {
  const searchParams = new URLSearchParams({
    token: params.token,
    method: params.method,
    scope: params.scope,
  });

  if (params.destination) {
    searchParams.set("destination", params.destination);
  }

  router.push(`/mfa/prompt?${searchParams.toString()}`);
};

function AuthenticatorEnrollment({
  currentMethod,
}: {
  currentMethod: MfaMethod | null;
}) {
  const router = useRouter();
  const [setup, setSetup] = useState<AuthenticatorSetup | null>(null);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isStartingSetup, setIsStartingSetup] = useState(false);
  const [isRequestingDisable, setIsRequestingDisable] = useState(false);

  useEffect(() => {
    return () => {
      setSetup(null);
    };
  }, []);

  const isEnrolled = currentMethod === "authenticator";
  const hasDifferentMethod =
    currentMethod !== null && currentMethod !== "authenticator";

  const handleEnable = async () => {
    setIsStartingSetup(true);
    setError(null);
    try {
      const response = await mfa({
        scope: "setup",
        method: "authenticator",
      });

      if (response && isRecord(response) && typeof response.url === "string") {
        router.push(response.url);
        return;
      }

      const parsed = parseAuthenticatorResponse(response);
      if (!parsed) {
        setSetup(null);
        setCopyState("idle");
        setError(
          "We couldn't start the authenticator setup. Please try again."
        );
        return;
      }

      if (parsed.scope === "challenge") {
        redirectToPrompt(router, {
          token: parsed.token,
          method: parsed.method,
          scope: parsed.scope,
        });
        return;
      }

      setSetup(parsed);
      setCopyState("idle");
    } catch (cause) {
      console.error("Failed to initiate authenticator setup", cause);
      setError(
        "We ran into a problem starting authenticator setup. Please retry."
      );
      setSetup(null);
      setCopyState("idle");
    } finally {
      setIsStartingSetup(false);
    }
  };

  const handleDisable = async () => {
    setIsRequestingDisable(true);
    setError(null);
    try {
      const response = await mfa({ method: "authenticator" });

      if (response && isRecord(response) && typeof response.url === "string") {
        router.push(response.url);
        return;
      }

      const parsed = parseAuthenticatorResponse(response);
      if (!parsed) {
        setError("We couldn't start the removal challenge. Please try again.");
        return;
      }

      setSetup(parsed);
    } catch (cause) {
      console.error("Failed to request authenticator removal challenge", cause);
      setError(
        "We ran into a problem starting the removal flow. Please retry."
      );
    } finally {
      setIsRequestingDisable(false);
    }
  };

  const recoveryText = useMemo(
    () => setup?.recoveryKeys?.join("\n") ?? "",
    [setup?.recoveryKeys]
  );

  return (
    <div className="flex w-full flex-col items-center gap-6 rounded-xl border border-border/60 bg-card/60 p-6">
      <div className="space-y-1 text-center">
        <h2 className="text-lg font-semibold">Authenticator app</h2>
        <p className="text-sm text-muted-foreground">
          Scan a QR code with your authenticator app and enter a 6-digit code to
          finish.
        </p>
      </div>

      {isEnrolled ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <p>You are currently enrolled with an authenticator app.</p>
          <Button disabled={isRequestingDisable} onClick={handleDisable}>
            {isRequestingDisable
              ? "Starting removal..."
              : "Disable authenticator"}
          </Button>
        </div>
      ) : hasDifferentMethod ? (
        <p className="text-sm text-muted-foreground">
          Disable your current MFA method before setting up an authenticator.
        </p>
      ) : (
        <Button size="lg" disabled={isStartingSetup} onClick={handleEnable}>
          {isStartingSetup ? "Starting setup..." : "Enable authenticator 2FA"}
        </Button>
      )}

      {setup?.scope === "setup" && setup.otpauthUrl ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-md border border-border bg-background p-3">
            <QRCode value={setup.otpauthUrl} size={192} className="h-48 w-48" />
          </div>
          <p className="text-sm text-muted-foreground">
            Scan the code with your authenticator app, then enter the 6-digit
            code below.
          </p>

          {setup.recoveryKeys ? (
            <div className="mt-4 flex w-full flex-col items-center gap-3 text-left">
              <div className="w-full max-w-sm space-y-2">
                <p className="text-sm font-medium">Recovery codes</p>
                <p className="text-xs text-muted-foreground">
                  Store these somewhere safe. Use one if you lose your
                  authenticator device.
                </p>
                <div className="rounded-md border border-dashed bg-muted/30 p-4">
                  <ul className="grid gap-2 font-mono text-sm">
                    {setup.recoveryKeys.map((key) => (
                      <li key={key}>{key}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={async () => {
                      if (!recoveryText) {
                        return;
                      }

                      if (!("clipboard" in navigator)) {
                        setCopyState("error");
                        return;
                      }

                      try {
                        await navigator.clipboard.writeText(recoveryText);
                        setCopyState("copied");
                      } catch (cause) {
                        console.error("Failed to copy recovery keys", cause);
                        setCopyState("error");
                      }
                    }}
                  >
                    <Copy className="size-4" aria-hidden="true" />
                    Copy
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (!recoveryText) {
                        return;
                      }

                      try {
                        const header = "Nile MFA recovery codes\n\n";
                        const blob = new Blob([header, recoveryText], {
                          type: "text/plain",
                        });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = "nile-mfa-recovery-codes.txt";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                      } catch (cause) {
                        console.error(
                          "Failed to download recovery keys",
                          cause
                        );
                      }
                    }}
                  >
                    <Download className="size-4" aria-hidden="true" />
                    Download
                  </Button>
                  {copyState === "copied" ? (
                    <span className="text-xs text-muted-foreground">
                      Recovery codes copied to clipboard.
                    </span>
                  ) : copyState === "error" ? (
                    <span className="text-xs text-destructive">
                      Unable to copy automatically. Please copy the codes
                      manually.
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          <MfaVerifyForm
            token={setup.token}
            scope={setup.scope}
            method={setup.method}
          />
        </div>
      ) : null}

      {setup && setup.scope === "challenge" ? (
        <div className="flex w-full max-w-sm flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">
            Enter a code from your authenticator app to confirm this action.
          </p>
          <MfaVerifyForm
            token={setup.token}
            scope={setup.scope}
            method={setup.method}
            remove={isEnrolled}
          />
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive text-center">{error}</p>
      ) : null}
    </div>
  );
}

function EmailEnrollment({
  currentMethod,
}: {
  currentMethod: MfaMethod | null;
}) {
  const router = useRouter();
  const [setup, setSetup] = useState<EmailSetup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStartingSetup, setIsStartingSetup] = useState(false);
  const [isRequestingDisable, setIsRequestingDisable] = useState(false);

  useEffect(() => {
    return () => {
      setSetup(null);
    };
  }, []);

  const isEnrolled = currentMethod === "email";
  const hasDifferentMethod =
    currentMethod !== null && currentMethod !== "email";

  const handleEnable = async () => {
    if (hasDifferentMethod) {
      return;
    }
    setIsStartingSetup(true);
    setError(null);
    try {
      const response = await mfa({ scope: "setup", method: "email" });

      if (
        response.ok &&
        isRecord(response) &&
        typeof response.url === "string"
      ) {
        router.push(response.url);
        return;
      }

      const parsed = parseEmailResponse(response);
      if (!parsed) {
        setSetup(null);
        setError("We couldn't start the email MFA setup. Please try again.");
        return;
      }

      if (parsed.scope === "challenge") {
        redirectToPrompt(router, {
          token: parsed.token,
          method: parsed.method,
          scope: parsed.scope,
          destination: parsed.maskedEmail,
        });
        return;
      }

      setSetup(parsed);
    } catch (cause) {
      console.error("Failed to initiate email MFA setup", cause);
      setError("We ran into a problem sending the email code. Please retry.");
      setSetup(null);
    } finally {
      setIsStartingSetup(false);
    }
  };

  const handleDisable = async () => {
    setIsRequestingDisable(true);
    setError(null);
    try {
      const response = await mfa({ method: "email" });

      if (
        response.ok &&
        isRecord(response) &&
        typeof response.url === "string"
      ) {
        router.push(response.url);
        return;
      }

      const parsed = parseEmailResponse(response);
      if (!parsed) {
        setError("We couldn't start the removal challenge. Please try again.");
        return;
      }

      setSetup(parsed);
    } catch (cause) {
      console.error("Failed to request email MFA removal challenge", cause);
      setError(
        "We ran into a problem starting the removal flow. Please retry."
      );
    } finally {
      setIsRequestingDisable(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-6 rounded-xl border border-border/60 bg-card/60 p-6">
      <div className="space-y-1 text-center">
        <h2 className="text-lg font-semibold">Email verification</h2>
        <p className="text-sm text-muted-foreground">
          Receive a one-time code over email and enter it to complete setup.
        </p>
      </div>

      {isEnrolled ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <p>You are currently enrolled with email-based MFA.</p>
          <Button disabled={isRequestingDisable} onClick={handleDisable}>
            {isRequestingDisable ? "Starting removal..." : "Disable email MFA"}
          </Button>
        </div>
      ) : hasDifferentMethod ? (
        <p className="text-sm text-muted-foreground">
          Disable your current MFA method before enabling email verification.
        </p>
      ) : (
        <Button size="lg" disabled={isStartingSetup} onClick={handleEnable}>
          {isStartingSetup ? "Sending code..." : "Enable email 2FA"}
        </Button>
      )}

      {setup && setup.scope === "setup" ? (
        <div className="flex w-full max-w-sm flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">
            {setup.maskedEmail
              ? `We sent a 6-digit code to ${setup.maskedEmail}. Enter it below to finish.`
              : "Check your email for a 6-digit code and enter it below to finish."}
          </p>
          <MfaVerifyForm
            token={setup.token}
            scope={setup.scope}
            method={setup.method}
          />
        </div>
      ) : null}

      {setup && setup.scope === "challenge" ? (
        <div className="flex w-full max-w-sm flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code we just emailed you to confirm this action.
          </p>
          <MfaVerifyForm
            token={setup.token}
            scope={setup.scope}
            method={setup.method}
            remove={isEnrolled}
          />
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive text-center">{error}</p>
      ) : null}
    </div>
  );
}

export default function EnrollMfa({
  enrolled,
  enrolledMethod,
}: EnrollMfaProps) {
  const currentMethod =
    enrolledMethod === "authenticator" || enrolledMethod === "email"
      ? enrolledMethod
      : enrolled
      ? "authenticator"
      : null;

  return (
    <div className="flex w-full flex-col gap-8">
      <AuthenticatorEnrollment currentMethod={currentMethod} />
      <EmailEnrollment currentMethod={currentMethod} />
    </div>
  );
}
