import { forwardRef, useImperativeHandle } from "react";

type MockTurnstileProps = {
  onSuccess?: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  siteKey?: string;
};

export const MockTurnstile = forwardRef<{ reset: () => void }, MockTurnstileProps>(
  function MockTurnstile({ onSuccess }, ref) {
    useImperativeHandle(ref, () => ({
      reset: () => {},
    }));

    return (
      <button
        type="button"
        data-testid="turnstile-mock"
        onClick={() => onSuccess?.("test-captcha-token")}
      >
        Complete captcha
      </button>
    );
  },
);
