import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AddRow({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="justify-self-start"
      onClick={onAdd}
    >
      <Plus />
      {label}
    </Button>
  );
}
