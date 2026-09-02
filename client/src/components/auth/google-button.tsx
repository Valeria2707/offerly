"use client";

import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";

import { GOOGLE_CLIENT_ID } from "@/constants/api";
import { useGoogleAuth } from "@/hooks/use-auth";

export function GoogleButton() {
  const googleAuth = useGoogleAuth();

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={({ credential }) => {
          if (!credential) {
            toast.error("Google не повернув токен. Спробуйте ще раз.");
            return;
          }
          googleAuth.mutate(credential);
        }}
        onError={() => toast.error("Не вдалося увійти через Google.")}
        text="continue_with"
        theme="outline"
        size="large"
        shape="rectangular"
        locale="uk"
        width="400"
      />
    </div>
  );
}
