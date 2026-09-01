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

  if (!token) {
    return (
      <>
        <AuthHeader
          title="Посилання недійсне"
          description="Схоже, посилання неповне або застаріле. Запросіть нове — воно діє 30 хвилин."
        />

        <AuthSwitch
          question="Потрібне нове посилання?"
          actionLabel="Відновити пароль"
          href={ROUTES.forgotPassword}
        />
      </>
    );
  }

  return (
    <>
      <AuthHeader
        title="Новий пароль"
        description="Придумайте пароль щонайменше на 8 символів."
      />

      <ResetPasswordForm token={token} />

      <AuthSwitch
        question="Згадали старий пароль?"
        actionLabel="Увійти"
        href={ROUTES.login}
      />
    </>
  );
}
