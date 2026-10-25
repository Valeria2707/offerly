"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormError } from "@/components/auth/form-error";
import { FormField } from "@/components/auth/form-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { ROUTES } from "@/constants/routes";
import { useResetPassword } from "@/hooks/use-auth";
import { resetPasswordSchema, type ResetPasswordValues } from "@/schemas/auth";

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const resetPassword = useResetPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(({ password }) =>
    resetPassword.mutate(
      { token, password },
      {
        onSuccess: () => {
          toast.success(t("reset.success"));
          router.push(ROUTES.login);
        },
      },
    ),
  );

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-5" noValidate>
      <FormField
        id="password"
        label={t("fields.newPassword")}
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register("password")}
      />

      <FormField
        id="confirm-password"
        label={t("fields.confirmPassword")}
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <FormError error={resetPassword.error} />

      <SubmitButton pending={resetPassword.isPending}>
        {t("reset.submit")}
      </SubmitButton>
    </form>
  );
}
