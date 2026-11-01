import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { readConfig } from './config';
import { setupApp } from './setup-app';

async function bootstrap() {
  const config = readConfig();
  const app = await NestFactory.create(AppModule);
  setupApp(app, config.origins);
  await app.listen(config.port);
}
bootstrap().catch(() => {
  console.error('Falha ao iniciar o backend. Verifique a configuração e a disponibilidade da porta.');
  process.exitCode = 1;
});
