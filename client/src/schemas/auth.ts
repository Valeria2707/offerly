import { z } from "zod";

const email = z.email("Введіть коректний email");
const password = z
  .string()
  .min(8, "Пароль має містити щонайменше 8 символів");

export const loginSchema = z.object({ email, password });

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Введіть ім’я")
      .max(150, "Не більше 150 символів"),
    email,
    password,
    confirmPassword: z.string(),
    terms: z
      .boolean()
      .refine((value) => value, { message: "Потрібно погодитись з умовами" }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Паролі не збігаються",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({ password, confirmPassword: z.string() })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Паролі не збігаються",
    path: ["confirmPassword"],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
