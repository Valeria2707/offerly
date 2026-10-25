"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormError } from "@/components/auth/form-error";
import { BasicsSection } from "@/components/profile/basics-section";
import { CareerSection } from "@/components/profile/career-section";
import { CvImportButton } from "@/components/profile/cv-import-button";
import { CvImportProgress } from "@/components/profile/cv-import-progress";
import { EducationSection } from "@/components/profile/education-section";
import { ExperienceSection } from "@/components/profile/experience-section";
import { LanguagesSection } from "@/components/profile/languages-section";
import { ProjectsSection } from "@/components/profile/projects-section";
import { SkillsSection } from "@/components/profile/skills-section";
import { Button } from "@/components/ui/button";
import { useImportCv, useSaveProfile } from "@/hooks/use-profile";
import { cleanProfileData, withBlankLink } from "@/lib/profile-data";
import type { Profile, ProfileData } from "@/types/profile";

type Source = { importId: string; filename: string };

export function ProfileForm({ profile }: { profile: Profile }) {
  const t = useTranslations("profile");
  const form = useForm<ProfileData>({
    defaultValues: withBlankLink(profile.data),
  });
  const save = useSaveProfile();
  const importCv = useImportCv();

  const [pendingFile, setPendingFile] = useState<string | null>(null);
  const [source, setSource] = useState<Source | null>(null);

  const onSubmit = form.handleSubmit((values) =>
    save.mutate(
      { data: cleanProfileData(values), importId: source?.importId ?? null },
      {
        onSuccess: (saved) => {
          setSource(null);
          form.reset(withBlankLink(saved.data));
          toast.success(t("saved"));
        },
      },
    ),
  );

  const importFile = (file: File) => {
    setPendingFile(file.name);
    importCv.mutate(file, {
      onSuccess: (cvImport) => {
        setPendingFile(null);
        if (!cvImport.draftData) return;

        form.reset(withBlankLink(cvImport.draftData));
        setSource({
          importId: cvImport.id,
          filename: cvImport.originalFilename,
        });
        toast.success(t("cv.parsed"));
      },
      onError: () => {
        setPendingFile(null);
        toast.error(t("cv.failed"));
      },
    });
  };

  const dirty = form.formState.isDirty || source !== null;

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="grid gap-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="grid gap-1">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>

          <div className="grid justify-items-end gap-1">
            <div className="flex items-center gap-2">
              <CvImportButton
                hasImport={source !== null}
                pending={importCv.isPending}
                onSelect={importFile}
              />
              <Button
                type="submit"
                disabled={save.isPending || importCv.isPending || !dirty}
              >
                {save.isPending && <Loader2 className="animate-spin" />}
                {t("save")}
              </Button>
            </div>

            {source && (
              <span className="font-mono text-[10px] text-terracotta">
                {t("cv.unsaved")}
              </span>
            )}
          </div>
        </header>

        {source && !importCv.isPending && (
          <p className="flex gap-3 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
            <span className="font-mono text-[10px] leading-5 tracking-wider text-foreground">
              CV
            </span>
            {t("cv.source", { filename: source.filename })}
          </p>
        )}

        {importCv.isPending ? (
          <CvImportProgress filename={pendingFile} />
        ) : (
          <>
            <BasicsSection />
            <CareerSection />

            <div className="grid gap-6 xl:grid-cols-2">
              <SkillsSection />
              <LanguagesSection />
            </div>

            <ExperienceSection />

            <div className="grid gap-6 xl:grid-cols-2">
              <EducationSection />
              <ProjectsSection />
            </div>

            <FormError error={save.error} />
          </>
        )}
      </form>
    </FormProvider>
  );
}
