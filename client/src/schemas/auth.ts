import { z } from "zod";

/** Повідомлення схем — ключі `validation.*`; перекладає їх FormField. */
export const VALIDATION_KEYS = [
  "email",
  "passwordMin",
  "nameRequired",
  "nameMax",
  "terms",
  "passwordsMismatch",
] as const;

export type ValidationKey = (typeof VALIDATION_KEYS)[number];

export function isValidationKey(value: string): value is ValidationKey {
  return VALIDATION_KEYS.some((key) => key === value);
}

const email = z.email("email" satisfies ValidationKey);
const password = z.string().min(8, "passwordMin" satisfies ValidationKey);

export const loginSchema = z.object({ email, password });

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "nameRequired" satisfies ValidationKey)
      .max(150, "nameMax" satisfies ValidationKey),
    email,
    password,
    confirmPassword: z.string(),
    terms: z.boolean().refine((value) => value, {
      message: "terms" satisfies ValidationKey,
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "passwordsMismatch" satisfies ValidationKey,
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({ password, confirmPassword: z.string() })
  .refine((values) => values.password === values.confirmPassword, {
    message: "passwordsMismatch" satisfies ValidationKey,
    path: ["confirmPassword"],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
