import { DataSource, DataSourceOptions } from 'typeorm';

export async function createDataSourceWithSchema(
  options: DataSourceOptions,
  schema: string
): Promise<DataSource> {
  const bootstrap = new DataSource({
    ...options,
    entities: [],
    synchronize: false,
    migrationsRun: false
  } as DataSourceOptions);
  await bootstrap.initialize();
  try {
    await bootstrap.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
  } finally {
    await bootstrap.destroy();
  }
  return new DataSource(options).initialize();
}
