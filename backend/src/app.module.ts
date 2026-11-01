import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { ReceitasModule } from './receitas/receitas.module';

@Module({ imports: [HealthModule, ReceitasModule] })
export class AppModule {}
