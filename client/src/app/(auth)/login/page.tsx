import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthSwitch } from "@/components/auth/auth-switch";
import { GoogleButton } from "@/components/auth/google-button";
import { LoginForm } from "@/components/auth/login-form";
import { ROUTES } from "@/constants/routes";

export default function LoginPage() {
  return (
    <>
      <AuthHeader
        title="Увійти в акаунт"
        description="Раді бачити знову — продовжимо з того, де зупинились."
      />

      <LoginForm />

      <div className="mt-6 grid gap-6">
        <AuthDivider label="або" />
        <GoogleButton />
      </div>

      <AuthSwitch
        question="Немає акаунта?"
        actionLabel="Зареєструватись"
        href={ROUTES.signup}
      />
    </>
  );
}
