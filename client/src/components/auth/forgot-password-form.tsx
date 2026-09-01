"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";

import { FormError } from "@/components/auth/form-error";
import { FormField } from "@/components/auth/form-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { useForgotPassword } from "@/hooks/use-auth";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/schemas/auth";

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(({ email }) => forgotPassword.mutate(email));

  if (forgotPassword.isSuccess) {
    return (
      <div className="mt-8 flex gap-3 rounded-lg bg-success-muted p-4">
        <MailCheck
          className="mt-0.5 size-4 shrink-0 text-success"
          aria-hidden
        />
        <p className="text-sm leading-relaxed text-success">
          Якщо акаунт з адресою {getValues("email")} існує, ми надіслали лист із
          посиланням для відновлення. Воно діє 30 хвилин.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-5" noValidate>
      <FormField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="olena.k@example.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <FormError error={forgotPassword.error} />

      <SubmitButton pending={forgotPassword.isPending}>
        Надіслати посилання
      </SubmitButton>
    </form>
  );
}
