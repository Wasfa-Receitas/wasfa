import { INestApplication } from '@nestjs/common';

export function setupApp(app: INestApplication, origins: string[]) {
  app.enableCors({ origin: origins, methods: ['GET', 'HEAD', 'OPTIONS'] });
  app.enableShutdownHooks();
}
