"use client";

import { Loader2 } from "lucide-react";

import { FormError } from "@/components/auth/form-error";
import { ProfileForm } from "@/components/profile/profile-form";
import { useProfile } from "@/hooks/use-profile";

export default function ProfilePage() {
  const { data: profile, isPending, error } = useProfile();

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      {isPending && (
        <div className="flex justify-center py-24">
          <Loader2 className="size-5 animate-spin text-subtle" />
        </div>
      )}

      <FormError error={error} />

      {profile && <ProfileForm key={profile.id} profile={profile} />}
    </div>
  );
}
