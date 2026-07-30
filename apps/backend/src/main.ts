import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS & Global Input Validation Pipe
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Set Global REST API Prefix
  app.setGlobalPrefix('api/v1');

  // Swagger OpenAPI Specification Baseline (IEEE SRS REQ-AUTH & Gateway Specs)
  const config = new DocumentBuilder()
    .setTitle('LifeOS Modular Monolith Backend API')
    .setDescription(
      'REST API contracts and OpenAPI specifications for LifeOS Personal Life Management Platform.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Authentication Engine (REQ-AUTH)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 LifeOS Backend Service running on port ${port}`);
  console.log(`📑 OpenAPI Swagger Documentation available at http://localhost:${port}/api/docs`);
}

bootstrap();
