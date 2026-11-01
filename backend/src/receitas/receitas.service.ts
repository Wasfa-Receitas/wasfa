import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ReceitasService {
  constructor(private readonly prisma: PrismaService) {}
  async listar() {
    try {
      return await this.prisma.receitas.findMany({
        take: 20,
        orderBy: { id_receita: 'asc' },
        select: { id_receita: true, nome: true, tempo_preparo: true, dificuldade: true },
      });
    } catch {
      throw new ServiceUnavailableException('Não foi possível consultar as receitas.');
    }
  }
}
