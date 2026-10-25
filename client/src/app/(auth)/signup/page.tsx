import { useTranslations } from "next-intl";

import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthSwitch } from "@/components/auth/auth-switch";
import { GoogleButton } from "@/components/auth/google-button";
import { SignupForm } from "@/components/auth/signup-form";
import { ROUTES } from "@/constants/routes";

export default function SignupPage() {
  const t = useTranslations("auth");

  return (
    <>
      <AuthHeader
        title={t("signup.title")}
        description={t("signup.description")}
      />

      <SignupForm />

      <div className="mt-6 grid gap-6">
        <AuthDivider label={t("or")} />
        <GoogleButton />
      </div>

      <AuthSwitch
        question={t("signup.hasAccount")}
        actionLabel={t("login.submit")}
        href={ROUTES.login}
      />
    </>
  );
}
