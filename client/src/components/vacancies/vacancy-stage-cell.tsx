import { StageStatusBadge } from "@/components/workflow/stage-status-badge";
import { useStageName } from "@/hooks/use-stage-name";
import { displayStage } from "@/lib/workflow";
import type { WorkflowSummary } from "@/types/workflow";

export function VacancyStageCell({
  summary,
}: {
  summary: WorkflowSummary | undefined;
}) {
  const stageName = useStageName();
  const stage = displayStage(summary);

  if (!stage) return <span className="text-muted-foreground">—</span>;

  return (
    <span className="grid gap-1">
      <span className="text-xs font-medium">{stageName(stage.name)}</span>
      <StageStatusBadge status={stage.status} />
    </span>
  );
}
