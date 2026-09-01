import { Separator } from "@/components/ui/separator";

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <Separator className="flex-1" />
      <span className="text-xs text-subtle">{label}</span>
      <Separator className="flex-1" />
    </div>
  );
}
