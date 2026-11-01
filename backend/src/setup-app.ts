import { INestApplication, ValidationPipe } from '@nestjs/common';

export function setupApp(app: INestApplication, origins: string[]) {
  app.enableCors({ origin: origins, methods: ['GET', 'POST', 'HEAD', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] });
  app.useGlobalPipes(new ValidationPipe({
    transform: true, whitelist: true, forbidNonWhitelisted: true,
    validationError: { target: false, value: false },
  }));
  app.enableShutdownHooks();
}
