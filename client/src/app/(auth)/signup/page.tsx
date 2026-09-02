import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthSwitch } from "@/components/auth/auth-switch";
import { GoogleButton } from "@/components/auth/google-button";
import { SignupForm } from "@/components/auth/signup-form";
import { ROUTES } from "@/constants/routes";

export default function SignupPage() {
  return (
    <>
      <AuthHeader title="Створити акаунт" description="Займе менше хвилини." />

      <SignupForm />

      <div className="mt-6 grid gap-6">
        <AuthDivider label="або" />
        <GoogleButton />
      </div>

      <AuthSwitch
        question="Вже є акаунт?"
        actionLabel="Увійти"
        href={ROUTES.login}
      />
    </>
  );
}
