import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  // Conexão sob demanda: /health continua disponível quando o MySQL está fora do ar.
  async onModuleDestroy() { await this.$disconnect(); }
}
