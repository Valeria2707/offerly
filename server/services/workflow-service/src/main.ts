import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { API_PREFIX } from '@offerly/helpers';
import { AppModule } from './app.module';
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.enableCors({ origin: config.getOrThrow<string>('APP_BASE_URL') });
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { exposeUnsetFields: false }
    })
  );
  if (
    process.env.SWAGGER_ENABLED === 'true' ||
    process.env.NODE_ENV !== 'production'
  ) {
    const document = new DocumentBuilder()
      .setTitle('Application workflow service')
      .setDescription('Stage catalog and per-vacancy application workflows')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup(
      'docs',
      app,
      SwaggerModule.createDocument(app, document)
    );
  }
  app.enableShutdownHooks();
  await app.listen(config.getOrThrow<number>('PORT'), '0.0.0.0');
}
void bootstrap();
