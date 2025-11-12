"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { mfa } from "@niledatabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import RecoveryCodeForm from "./RecoveryCodeForm";

type MfaVerifyFormProps = {
  token: string;
  scope: "setup" | "challenge";
  method: "email" | "authenticator";
  remove?: boolean;
};

const CODE_LENGTH = 6;

export default function MfaVerifyForm({
  token,
  scope,
  method,
  remove,
}: MfaVerifyFormProps) {
  const router = useRouter();
  const [values, setValues] = React.useState<string[]>(
    Array(CODE_LENGTH).fill("")
  );
  const [challengeToken, setChallengeToken] = React.useState(token);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isRequestingRecovery, setIsRequestingRecovery] = React.useState(false);
  const [showRecoveryInput, setShowRecoveryInput] = React.useState(false);
  const errorId = React.useId();

  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  React.useEffect(() => {
    if (!showRecoveryInput) {
      inputRefs.current[0]?.focus();
    }
  }, [showRecoveryInput]);

  React.useEffect(() => {
    setChallengeToken(token);
  }, [token]);

  const handleInputChange =
    (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value.replace(/\D+/g, "");
      if (!raw.length) {
        updateValue(index, "");
        return;
      }
      const nextDigit = raw.at(-1) ?? "";
      updateValue(index, nextDigit);
      if (index < CODE_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

  const handleKeyDown =
    (index: number) => (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Backspace") {
        if (values[index]) {
          updateValue(index, "");
        } else if (index > 0) {
          inputRefs.current[index - 1]?.focus();
          updateValue(index - 1, "");
        }
        event.preventDefault();
      }
      if (event.key === "ArrowLeft" && index > 0) {
        inputRefs.current[index - 1]?.focus();
        event.preventDefault();
      }
      if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
        event.preventDefault();
      }
    };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D+/g, "")
      .slice(0, CODE_LENGTH)
      .split("");

    if (!pasted.length) {
      return;
    }

    const next = [...values];
    for (let i = 0; i < CODE_LENGTH; i += 1) {
      next[i] = pasted[i] ?? "";
    }
    setValues(next);

    const nextFocusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[nextFocusIndex]?.focus();
  };

  const updateValue = (index: number, digit: string) => {
    setValues((previous) => {
      const next = [...previous];
      next[index] = digit;
      return next;
    });
    setError(null);
    setSuccessMessage(null);
  };

  const code = React.useMemo(() => values.join(""), [values]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!challengeToken) {
      setError("Missing MFA challenge token. Please restart the sign-in flow.");
      return;
    }

    if (code.length !== CODE_LENGTH) {
      setError("Enter the full 6-digit code to continue.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await mfa({
        token: challengeToken,
        code,
        scope,
        method,
        remove,
      });
      if (result.ok) {
        setSuccessMessage(
          result.scope === "setup"
            ? "MFA setup confirmed. Redirecting..."
            : "You're all set. Redirecting..."
        );
        window.location.reload();
      } else {
        const url = new URL(result.url);
        setError(url.searchParams.get("error"));
      }
    } catch (cause) {
      console.error("Failed to verify MFA challenge", cause);
      setError("We ran into a problem verifying the code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisableRecovery = () => {
    setShowRecoveryInput(false);
    setValues(Array(CODE_LENGTH).fill(""));
    setError(null);
    setSuccessMessage(null);
  };

  const handleEnableRecovery = async () => {
    if (showRecoveryInput) {
      return;
    }
    setError(null);
    setSuccessMessage(null);

    setShowRecoveryInput(true);
  };

  const handleRecoverySuccess = React.useCallback(
    (resultScope: "setup" | "challenge") => {
      setSuccessMessage(
        resultScope === "setup"
          ? "MFA setup confirmed. Redirecting..."
          : "You're all set. Redirecting..."
      );
      window.location.reload();
    },
    [router]
  );

  return (
    <div className="space-y-6">
      {showRecoveryInput ? (
        <RecoveryCodeForm
          token={challengeToken}
          scope={scope}
          method={method}
          remove={remove}
          onSuccess={handleRecoverySuccess}
          onCancel={handleDisableRecovery}
        />
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <fieldset
            className="flex flex-col gap-6"
            disabled={isSubmitting || isRequestingRecovery}
          >
            <div className="flex justify-center gap-3">
              {values.map((value, index) => (
                <Input
                  key={index}
                  ref={(node) => {
                    inputRefs.current[index] = node;
                  }}
                  className={cn(
                    "h-14 w-12 rounded-lg border border-input/80 bg-muted/40 text-center text-2xl font-medium tracking-[0.25em]",
                    "placeholder:text-muted-foreground/80 focus-visible:ring-2 focus-visible:ring-primary/40"
                  )}
                  inputMode="numeric"
                  type="text"
                  autoComplete="one-time-code"
                  aria-label={`Digit ${index + 1}`}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? errorId : undefined}
                  pattern="[0-9]*"
                  maxLength={1}
                  value={value}
                  onChange={handleInputChange(index)}
                  onKeyDown={handleKeyDown(index)}
                  onPaste={handlePaste}
                />
              ))}
            </div>
            <Button
              className="w-full"
              type="submit"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Submit"}
            </Button>
          </fieldset>

          {error ? (
            <p
              className="text-sm font-medium text-destructive"
              id={errorId}
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </form>
      )}
      {!isRequestingRecovery ? (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="link"
            className="p-0 text-sm"
            onClick={handleEnableRecovery}
            disabled={isSubmitting || isRequestingRecovery}
          >
            Use a recovery code
          </Button>
        </div>
      ) : null}
      {successMessage ? (
        <p className="text-sm font-medium text-emerald-600" role="status">
          {successMessage}
        </p>
      ) : null}
    </div>
  );
}
