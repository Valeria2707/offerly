import { useTranslations } from "next-intl";

import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthSwitch } from "@/components/auth/auth-switch";
import { GoogleButton } from "@/components/auth/google-button";
import { LoginForm } from "@/components/auth/login-form";
import { ROUTES } from "@/constants/routes";

export default function LoginPage() {
  const t = useTranslations("auth");

  return (
    <>
      <AuthHeader
        title={t("login.title")}
        description={t("login.description")}
      />

      <LoginForm />

      <div className="mt-6 grid gap-6">
        <AuthDivider label={t("or")} />
        <GoogleButton />
      </div>

      <AuthSwitch
        question={t("login.noAccount")}
        actionLabel={t("signup.submit")}
        href={ROUTES.signup}
      />
    </>
  );
}
