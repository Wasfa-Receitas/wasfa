require('reflect-metadata');
process.env.JWT_SECRET = 'test-only-key-not-for-production-1234567890';
const { Test } = require('@nestjs/testing');
const request = require('supertest');
const { AppModule } = require('../dist/app.module');
const { PrismaService } = require('../dist/database/prisma.service');
const { setupApp } = require('../dist/setup-app');

describe('Pesquisa de receitas: HTTP + serviço + consultas parametrizadas', () => {
  let app, db, rows, total, queries;
  const row = { id_receita: 1, nome: 'Panqueca', modo_preparo: 'Misture.', tempo_preparo: 15, dificuldade: 'Facil', matched_ingredients: 2n };
  beforeAll(async () => {
    db = {
      $queryRaw: jest.fn((query) => { queries.push(query); return Promise.resolve(query.sql.includes('COUNT(*)') ? [{ total }] : rows); }),
      $transaction: jest.fn((operations) => Promise.all(operations)),
      receitas: { findUnique: jest.fn() },
    };
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService).useValue(db).compile();
    app = module.createNestApplication({ logger: false });
    setupApp(app, ['http://localhost:5173']);
    await app.init();
  });
  beforeEach(() => { jest.clearAllMocks(); rows = [row]; total = 1n; queries = []; });
  afterAll(async () => { await app.close(); });
  const http = () => request(app.getHttpServer());

  test('lista com paginação padrão e aceita barra final', async () => {
    const result = await http().get('/recipes/').expect(200);
    expect(result.body).toEqual({ items: [{ ...row, matched_ingredients: 2 }], total: 1, page: 1, limit: 10 });
    expect(queries[1].values.slice(-2)).toEqual([10, 0]);
    expect(queries[1].sql).toContain('ORDER BY matched_ingredients DESC, r.id_receita ASC');
  });
  test('pesquisa parcial por nome com valores parametrizados', async () => {
    await http().get('/recipes').query({ name: ' bolo ' }).expect(200);
    expect(queries[0].values).toContain('%bolo%');
    expect(queries[0].sql).toContain('r.nome LIKE ?');
    expect(queries[0].sql).not.toContain('bolo');
  });
  test('pesquisa por ingrediente via relação existente', async () => {
    await http().get('/recipes?ingredients=banana').expect(200);
    expect(queries[1].sql).toContain('JOIN ingredientes');
    expect(queries[1].sql).toContain('ri.id_receita = r.id_receita');
    expect(queries[1].values).toContain('%banana%');
  });
  test('normaliza vários ingredientes, remove vazios e repetidos, classifica antes de paginar', async () => {
    await http().get('/recipes').query({ ingredients: ' Banana, , aveia,banana, ', page: '2', limit: '5' }).expect(200);
    const values = queries[1].values;
    expect(values.filter((value) => value === '%banana%')).toHaveLength(2); // score e WHERE
    expect(values.filter((value) => value === '%aveia%')).toHaveLength(2);
    expect(values.slice(-2)).toEqual([5, 5]);
    expect(queries[1].sql).toContain('EXISTS');
    expect(queries[1].sql).toContain(' + ');
    expect(queries[1].sql).not.toContain('FROM receitas r JOIN'); // evita duplicar receitas
  });
  test('combina nome AND ingredientes', async () => {
    await http().get('/recipes?name=bolo&ingredients=banana').expect(200);
    expect(queries[0].sql).toContain(' AND ');
    expect(queries[0].values).toEqual(['%bolo%', '%banana%']);
  });
  test('sem resultados retorna lista vazia', async () => {
    rows = []; total = 0n;
    await http().get('/recipes?name=inexistente').expect(200)
      .expect({ items: [], total: 0, page: 1, limit: 10 });
  });
  test('detalhe utiliza somente campos do banco e inclui quantidades', async () => {
    const { matched_ingredients, ...recipe } = row;
    db.receitas.findUnique.mockResolvedValue({ ...recipe, receita_ingredientes: [
      { quantidade: '1 unidade', ingredientes: { id_ingrediente: 1, nome: 'Banana' } },
    ] });
    await http().get('/recipes/1').expect(200).expect({ ...recipe, ingredientes: [
      { id_ingrediente: 1, nome: 'Banana', quantidade: '1 unidade' },
    ] });
    expect(db.receitas.findUnique.mock.calls[0][0].where).toEqual({ id_receita: 1 });
    db.receitas.findUnique.mockResolvedValue(null);
    await http().get('/recipes/999').expect(404);
  });
  test.each(['page=0', 'page=-1', 'page=1.5', 'page=abc', 'page=100001', 'limit=0', 'limit=101',
    'limit=', 'page=1&page=2', 'ingredients=banana&ingredients=aveia', 'unknown=x',
    `name=${'a'.repeat(101)}`, `ingredients=${'a'.repeat(101)}`,
    `ingredients=${Array.from({ length: 21 }, (_, i) => 'term' + i).join(',')}`,
  ])('parâmetro inválido retorna 400: %s', async (query) => {
    await http().get(`/recipes?${query}`).expect(400);
    expect(db.$queryRaw).not.toHaveBeenCalled();
  });
  test.each(['0', '-1', 'abc', '1.5', '2147483648'])('ID inválido: %s', async (id) => {
    await http().get(`/recipes/${id}`).expect(400);
  });
  test('ingredientes vazios são ignorados', async () => {
    await http().get('/recipes').query({ ingredients: ' , , ' }).expect(200);
    expect(queries[0].sql).not.toContain('EXISTS');
  });
  test('SQL injection e curingas são tratados como texto', async () => {
    const term = "%' OR 1=1 --_!";
    await http().get('/recipes').query({ name: term }).expect(200);
    expect(queries[0].sql).not.toContain(term);
    expect(queries[0].values).toContain("%!%' OR 1=1 --!_!!%");
  });
  test('falha de banco retorna 503 sem detalhes internos', async () => {
    db.$transaction.mockRejectedValueOnce(new Error('private database information'));
    const result = await http().get('/recipes').expect(503);
    expect(JSON.stringify(result.body)).not.toContain('private database');
    db.receitas.findUnique.mockRejectedValueOnce(new Error('private database information'));
    await http().get('/recipes/1').expect(503);
  });
});
