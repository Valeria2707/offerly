import Link from "next/link";

import type { AppRoute } from "@/constants/routes";

type AuthSwitchProps = {
  question: string;
  actionLabel: string;
  href: AppRoute;
};

export function AuthSwitch({ question, actionLabel, href }: AuthSwitchProps) {
  return (
    <p className="mt-8 text-center text-sm text-muted-foreground">
      {question}{" "}
      <Link
        href={href}
        className="font-medium text-primary transition-opacity hover:opacity-80"
      >
        {actionLabel}
      </Link>
    </p>
  );
}
