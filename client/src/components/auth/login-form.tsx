"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { FormError } from "@/components/auth/form-error";
import { FormField } from "@/components/auth/form-field";
import { SubmitButton } from "@/components/auth/submit-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import { useLogin } from "@/hooks/use-auth";
import { loginSchema, type LoginValues } from "@/schemas/auth";

export function LoginForm() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit((values) => login.mutate(values));

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

      <div className="grid gap-3">
        <FormField
          id="password"
          label="Пароль"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" defaultChecked />
            <Label
              htmlFor="remember"
              className="font-normal text-muted-foreground"
            >
              Запам’ятати мене
            </Label>
          </div>

          <Link
            href={ROUTES.forgotPassword}
            className="text-sm font-medium text-primary transition-opacity hover:opacity-80"
          >
            Забули пароль?
          </Link>
        </div>
      </div>

      <FormError error={login.error} />

      <SubmitButton pending={login.isPending}>Увійти</SubmitButton>
    </form>
  );
}
