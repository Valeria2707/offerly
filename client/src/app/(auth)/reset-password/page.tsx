import { getTranslations } from "next-intl/server";

import { AuthHeader } from "@/components/auth/auth-header";
import { AuthSwitch } from "@/components/auth/auth-switch";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { ROUTES } from "@/constants/routes";

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;
  const t = await getTranslations("auth");

  if (!token) {
    return (
      <>
        <AuthHeader
          title={t("reset.invalidTitle")}
          description={t("reset.invalidDescription")}
        />

        <AuthSwitch
          question={t("reset.needLink")}
          actionLabel={t("reset.restore")}
          href={ROUTES.forgotPassword}
        />
      </>
    );
  }

  return (
    <>
      <AuthHeader
        title={t("reset.title")}
        description={t("reset.description")}
      />

      <ResetPasswordForm token={token} />

      <AuthSwitch
        question={t("reset.rememberedOld")}
        actionLabel={t("login.submit")}
        href={ROUTES.login}
      />
    </>
  );
}
