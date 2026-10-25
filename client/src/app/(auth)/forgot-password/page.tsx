import { useTranslations } from "next-intl";

import { AuthHeader } from "@/components/auth/auth-header";
import { AuthSwitch } from "@/components/auth/auth-switch";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { ROUTES } from "@/constants/routes";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");

  return (
    <>
      <AuthHeader
        title={t("forgot.title")}
        description={t("forgot.description")}
      />

      <ForgotPasswordForm />

      <AuthSwitch
        question={t("forgot.remembered")}
        actionLabel={t("login.submit")}
        href={ROUTES.login}
      />
    </>
  );
}
