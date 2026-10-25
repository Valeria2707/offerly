"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";

import { FormError } from "@/components/auth/form-error";
import { FormField } from "@/components/auth/form-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/hooks/use-auth";
import { registerSchema, type RegisterValues } from "@/schemas/auth";

export function SignupForm() {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");
  const signup = useRegister();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onSubmit = handleSubmit(({ name, email, password }) =>
    signup.mutate({ name, email, password }),
  );

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-5" noValidate>
      <FormField
        id="name"
        label={t("fields.name")}
        autoComplete="name"
        placeholder={t("fields.namePlaceholder")}
        error={errors.name?.message}
        {...register("name")}
      />

      <FormField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="olena.k@example.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <FormField
        id="password"
        label={t("fields.password")}
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="grid gap-3">
        <FormField
          id="confirm-password"
          label={t("fields.confirmPassword")}
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <div className="grid gap-1.5">
          <div className="flex items-start gap-2">
            <Controller
              control={control}
              name="terms"
              render={({ field }) => (
                <Checkbox
                  id="terms"
                  className="mt-0.5"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label
              htmlFor="terms"
              className="items-start text-xs leading-relaxed font-normal text-muted-foreground"
            >
              {t("signup.terms")}
            </Label>
          </div>

          {errors.terms && (
            <p className="text-xs text-destructive">{tv("terms")}</p>
          )}
        </div>
      </div>

      <FormError error={signup.error} />

      <SubmitButton pending={signup.isPending}>
        {t("signup.submit")}
      </SubmitButton>
    </form>
  );
}
