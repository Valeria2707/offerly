"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { GOOGLE_CLIENT_ID } from "@/constants/api";
import { useGoogleAuth } from "@/hooks/use-auth";

export function GoogleButton() {
  const t = useTranslations("auth.google");
  const googleAuth = useGoogleAuth();

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={({ credential }) => {
          if (!credential) {
            toast.error(t("noToken"));
            return;
          }
          googleAuth.mutate(credential);
        }}
        onError={() => toast.error(t("failed"))}
        text="continue_with"
        theme="outline"
        size="large"
        shape="rectangular"
        width="400"
      />
    </div>
  );
}
