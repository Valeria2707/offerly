import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.APP_BASE_URL ?? 'http://localhost:3001'
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );
  if (
    process.env.SWAGGER_ENABLED === 'true' ||
    process.env.NODE_ENV !== 'production'
  ) {
    const config = new DocumentBuilder()
      .setTitle('Application workflow service')
      .setDescription('Stage catalog and per-vacancy application workflows')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
  }
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3004, '0.0.0.0');
}
void bootstrap();
