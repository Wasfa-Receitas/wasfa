import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { SearchRecipesDto } from './dto/search-recipes.dto';

// ! é o escape explícito do LIKE: %, _ e ! da entrada são caracteres literais.
function contains(term: string) { return `%${term.replace(/[!%_]/g, '!$&')}%`; }
type RecipeRow = { id_receita: number; nome: string; modo_preparo: string; tempo_preparo: number; dificuldade: string; imagem_url: string | null; matched_ingredients: bigint | number };

@Injectable()
export class RecipesService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: SearchRecipesDto) {
    const terms = query.ingredients ?? [];
    // Cada termo vale no máximo um ponto, mesmo que encontre vários ingredientes.
    const score = terms.length ? Prisma.join(terms.map((term) => Prisma.sql`EXISTS (
      SELECT 1 FROM receita_ingredientes ri
      JOIN ingredientes i ON i.id_ingrediente = ri.id_ingrediente
      WHERE ri.id_receita = r.id_receita AND i.nome LIKE ${contains(term)} ESCAPE '!'
    )`), ' + ') : Prisma.sql`0`;
    const conditions: Prisma.Sql[] = [];
    if (query.q) conditions.push(Prisma.sql`(r.nome LIKE ${contains(query.q)} ESCAPE '!' OR EXISTS (
      SELECT 1 FROM receita_ingredientes ri
      JOIN ingredientes i ON i.id_ingrediente = ri.id_ingrediente
      WHERE ri.id_receita = r.id_receita AND i.nome LIKE ${contains(query.q)} ESCAPE '!'
    ))`);
    if (query.name) conditions.push(Prisma.sql`r.nome LIKE ${contains(query.name)} ESCAPE '!'`);
    if (terms.length) conditions.push(Prisma.sql`(${score}) > 0`);
    const where = conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;
    const offset = (query.page - 1) * query.limit;
    try {
      const [counts, rows] = await this.prisma.$transaction([
        this.prisma.$queryRaw<{ total: bigint }[]>(Prisma.sql`SELECT COUNT(*) AS total FROM receitas r ${where}`),
        this.prisma.$queryRaw<RecipeRow[]>(Prisma.sql`
          SELECT r.id_receita, r.nome, r.modo_preparo, r.tempo_preparo, r.dificuldade, r.imagem_url,
                 (${score}) AS matched_ingredients
          FROM receitas r ${where}
          ORDER BY matched_ingredients DESC, r.id_receita ASC
          LIMIT ${query.limit} OFFSET ${offset}`),
      ], { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
      return {
        items: rows.map((row) => ({ ...row, matched_ingredients: Number(row.matched_ingredients) })),
        total: Number(counts[0].total), page: query.page, limit: query.limit,
      };
    } catch { throw new ServiceUnavailableException('Não foi possível consultar as receitas.'); }
  }

  async detail(id: number) {
    let recipe;
    try {
      recipe = await this.prisma.receitas.findUnique({
        where: { id_receita: id },
        select: {
          id_receita: true, nome: true, modo_preparo: true, tempo_preparo: true, dificuldade: true, imagem_url: true,
          receita_ingredientes: {
            orderBy: { id_ingrediente: 'asc' },
            select: { quantidade: true, ingredientes: { select: { id_ingrediente: true, nome: true } } },
          },
        },
      });
    } catch { throw new ServiceUnavailableException('Não foi possível consultar a receita.'); }
    if (!recipe) throw new NotFoundException('Receita não encontrada.');
    const { receita_ingredientes, ...data } = recipe;
    return { ...data, ingredientes: receita_ingredientes.map((item) => ({ ...item.ingredientes, quantidade: item.quantidade })) };
  }
}
