import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PreparationController } from '../src/preparation/preparation.controller';
import { PreparationService } from '../src/preparation/preparation.service';

@Module({
  controllers: [PreparationController],
  providers: [{ provide: PreparationService, useValue: {} }]
})
class SwaggerTestModule {}

describe('preparation Swagger authentication', () => {
  it('uses bearer security without a separate authorization parameter', async () => {
    const app = await NestFactory.create(SwaggerTestModule, {
      logger: false,
      abortOnError: false
    });
    try {
      const config = new DocumentBuilder().addBearerAuth().build();
      const document = SwaggerModule.createDocument(app, config);
      const operation =
        document.paths['/workflows/{workflowId}/stages/{stageId}/preparation']
          ?.post;
      expect(operation).toBeDefined();
      expect(operation?.security).toEqual([{ bearer: [] }]);
      expect(operation?.parameters).toEqual([
        expect.objectContaining({ name: 'workflowId', in: 'path' }),
        expect.objectContaining({ name: 'stageId', in: 'path' })
      ]);
    } finally {
      await app.close();
    }
  });
});
