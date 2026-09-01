"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4.5" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.06 12.25c0-.85-.08-1.67-.22-2.45H12v4.63h6.2a5.3 5.3 0 0 1-2.3 3.48v2.89h3.72c2.18-2 3.44-4.96 3.44-8.55Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.11 0 5.72-1.03 7.62-2.8l-3.72-2.88c-1.03.69-2.35 1.1-3.9 1.1-3 0-5.55-2.02-6.46-4.75H1.69v2.98A11.5 11.5 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.54 14.67a6.9 6.9 0 0 1 0-4.4V7.29H1.69a11.5 11.5 0 0 0 0 10.36l3.85-2.98Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.69 0 3.21.58 4.4 1.72l3.3-3.3C17.72 1.27 15.11.25 12 .25 7.52.25 3.64 2.82 1.69 6.57l3.85 2.98C6.45 6.82 9 4.75 12 4.75Z"
      />
    </svg>
  );
}

export function GoogleButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="h-12 w-full rounded-lg bg-card font-semibold"
      onClick={() =>
        toast.info(
          "Вхід через Google з’явиться пізніше — auth-service поки що приймає лише email і пароль.",
        )
      }
    >
      <GoogleIcon />
      Продовжити з Google
    </Button>
  );
}
