import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { ReceitasModule } from './receitas/receitas.module';
import { AuthModule } from './auth/auth.module';
import { RecipesModule } from './recipes/recipes.module';

@Module({ imports: [HealthModule, ReceitasModule, AuthModule, RecipesModule] })
export class AppModule {}
