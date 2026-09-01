import { AuthHeader } from "@/components/auth/auth-header";
import { AuthSwitch } from "@/components/auth/auth-switch";
import { SignupForm } from "@/components/auth/signup-form";
import { ROUTES } from "@/constants/routes";

export default function SignupPage() {
  return (
    <>
      <AuthHeader title="Створити акаунт" description="Займе менше хвилини." />

      <SignupForm />

      <AuthSwitch
        question="Вже є акаунт?"
        actionLabel="Увійти"
        href={ROUTES.login}
      />
    </>
  );
}
