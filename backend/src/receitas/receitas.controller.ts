import { Controller, Get } from '@nestjs/common';
import { ReceitasService } from './receitas.service';

@Controller('receitas')
export class ReceitasController {
  constructor(private readonly receitas: ReceitasService) {}
  @Get() listar() { return this.receitas.listar(); }
}
