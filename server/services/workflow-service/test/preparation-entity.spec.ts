import { DataSource } from 'typeorm';
import { StageType } from '../src/stage-type/entities/stage-type.entity';
import { ApplicationWorkflow } from '../src/workflow/entities/application-workflow.entity';
import { StageNote } from '../src/workflow/entities/stage-note.entity';
import { WorkflowStage } from '../src/workflow/entities/workflow-stage.entity';
import { StagePreparationData } from '../src/preparation/entities/stage-preparation.entity';
class MetadataDataSource extends DataSource {
  async buildForTest(): Promise<void> {
    await this.buildMetadatas();
  }
}
it('registers a JSONB preparation with one-to-one uniqueness and cascading stage deletion', async () => {
  const source = new MetadataDataSource({
    type: 'postgres',
    entities: [
      StageType,
      ApplicationWorkflow,
      WorkflowStage,
      StageNote,
      StagePreparationData
    ]
  });
  await source.buildForTest();
  const metadata = source.getMetadata(StagePreparationData);
  expect(metadata.schema).toBe('workflow');
  expect(
    metadata.columns.find((column) => column.propertyName === 'data')?.type
  ).toBe('jsonb');
  expect(
    metadata.uniques.some(
      (unique) =>
        unique.columns.length === 1 &&
        unique.columns[0].propertyName === 'stageId'
    )
  ).toBe(true);
  expect(
    metadata.foreignKeys.find(
      (key) => key.referencedEntityMetadata.target === WorkflowStage
    )?.onDelete
  ).toBe('CASCADE');
  expect(
    source
      .getMetadata(WorkflowStage)
      .foreignKeys.find(
        (key) => key.referencedEntityMetadata.target === ApplicationWorkflow
      )?.onDelete
  ).toBe('CASCADE');
});
