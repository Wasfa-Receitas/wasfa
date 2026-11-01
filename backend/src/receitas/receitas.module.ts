import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ReceitasController } from './receitas.controller';
import { ReceitasService } from './receitas.service';

@Module({ imports: [DatabaseModule], controllers: [ReceitasController], providers: [ReceitasService] })
export class ReceitasModule {}
