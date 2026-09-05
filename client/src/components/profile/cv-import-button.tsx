"use client";

import { Loader2, Upload } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";

const ACCEPTED_TYPES = ".pdf,.docx";

export function CvImportButton({
  hasImport,
  pending,
  onSelect,
}: {
  hasImport: boolean;
  pending: boolean;
  onSelect: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onSelect(file);
          event.target.value = "";
        }}
      />

      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
      >
        {pending ? <Loader2 className="animate-spin" /> : <Upload />}
        {hasImport ? "Завантажити інше CV" : "Завантажити CV"}
      </Button>
    </>
  );
}
