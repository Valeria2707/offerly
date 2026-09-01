import { AuthHeader } from "@/components/auth/auth-header";
import { AuthSwitch } from "@/components/auth/auth-switch";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { ROUTES } from "@/constants/routes";

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeader
        title="Забули пароль?"
        description="Введіть email — надішлемо посилання для відновлення."
      />

      <ForgotPasswordForm />

      <AuthSwitch
        question="Згадали пароль?"
        actionLabel="Увійти"
        href={ROUTES.login}
      />
    </>
  );
}
