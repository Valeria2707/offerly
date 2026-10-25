import { StageStatusBadge } from "@/components/workflow/stage-status-badge";
import { useStageName } from "@/hooks/use-stage-name";
import type { WorkflowSummary } from "@/types/workflow";

export function VacancyStageCell({
  summary,
}: {
  summary: WorkflowSummary | undefined;
}) {
  const stageName = useStageName();

  if (!summary?.currentStage)
    return <span className="text-muted-foreground">—</span>;

  return (
    <span className="grid gap-1">
      <span className="text-xs font-medium">
        {stageName(summary.currentStage.name)}
      </span>
      <StageStatusBadge status={summary.currentStage.status} />
    </span>
  );
}
