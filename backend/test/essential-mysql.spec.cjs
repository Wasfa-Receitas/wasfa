require('reflect-metadata');
require('dotenv/config');
const { Test } = require('@nestjs/testing');
const request = require('supertest');
const { randomUUID } = require('node:crypto');
const argon2 = require('argon2');
const { PrismaClient } = require('@prisma/client');
const { AppModule } = require('../dist/app.module');
const { PrismaService } = require('../dist/database/prisma.service');
const { setupApp } = require('../dist/setup-app');

const suite = process.env.WASFA_MYSQL_TESTS === '1' ? describe : describe.skip;
suite('Homologação essencial — Jest/Supertest e MySQL real', () => {
  let prisma, transaction, app, release, email, token, database;
  const senha = randomUUID();
  const rollback = new Error('homologation-rollback');
  beforeAll(async () => {
    prisma = new PrismaClient();
    let ready, fail;
    const started = new Promise((resolve, reject) => { ready = resolve; fail = reject; });
    const hold = new Promise((resolve) => { release = resolve; });
    transaction = prisma.$transaction(async (tx) => {
      const provider = { usuarios: tx.usuarios, receitas: tx.receitas,
        $queryRaw: (...args) => tx.$queryRaw(...args),
        // A transação externa fornece a mesma conexão e snapshot aos serviços.
        $transaction: (operations) => Promise.all(operations) };
      database = provider;
      const module = await Test.createTestingModule({ imports: [AppModule] })
        .overrideProvider(PrismaService).useValue(provider).compile();
      app = module.createNestApplication({ logger: false });
      setupApp(app, ['http://localhost:5173']);
      await app.init(); email = `homolog-${randomUUID()}@example.com`;
      ready(); await hold; throw rollback;
    }, { timeout: 60000, isolationLevel: 'RepeatableRead' }).catch((error) => {
      if (error !== rollback) { fail(error); throw error; }
    });
    // Evita rejeição não observada durante o hook de inicialização.
    transaction.catch(() => {});
    await started;
  }, 30000);
  afterAll(async () => {
    try { if (app) await app.close(); }
    finally { if (release) release(); try {
      if (transaction) await transaction;
      if (email) expect(await prisma.usuarios.count({ where: { email } })).toBe(0);
    } finally { if (prisma) await prisma.$disconnect(); } }
  });
  const http = () => request(app.getHttpServer());
  test('AUT-01 cadastro 201 e hash sem vazamento', async () => {
    const result = await http().post('/auth/register').send({ nome: 'Homologação', email, senha }).expect(201);
    token = result.body.accessToken;
    expect(typeof token).toBe('string');
    expect(Object.keys(result.body.usuario).sort()).toEqual(['email', 'id_usuario', 'nome']);
    const stored = await database.usuarios.findUnique({ where: { email }, select: { senha: true } });
    expect(await argon2.verify(stored.senha, senha)).toBe(true);
  });
  test('AUT-02 email duplicado 409', async () => {
    await http().post('/auth/register').send({ nome: 'Duplicado', email: email.toUpperCase(), senha }).expect(409);
  });
  test('AUT-03 login 200', async () => {
    const result = await http().post('/auth/login').send({ email, senha }).expect(200);
    expect(result.body.usuario.email).toBe(email);
    expect(typeof result.body.accessToken).toBe('string');
  });
  test('AUT-04 credenciais inválidas 401', async () => {
    await http().post('/auth/login').send({ email, senha: 'incorreta' }).expect(401);
  });
  test('AUT-05 perfil com JWT 200 e sem JWT 401', async () => {
    const result = await http().get('/auth/me').set('Authorization', `Bearer ${token}`).expect(200);
    expect(result.body.email).toBe(email);
    await http().get('/auth/me').expect(401);
  });
  test('REC-01 listagem paginada', async () => {
    const { body } = await http().get('/recipes?limit=2').expect(200);
    expect(body.total).toBe(10); expect(body.items).toHaveLength(2);
  });
  test('REC-02 pesquisa parcial por nome', async () => {
    const { body } = await http().get('/recipes?name=banana').expect(200);
    expect(body.items.map((r) => r.nome).sort()).toEqual(['Panqueca de banana', 'Vitamina de banana']);
  });
  test('REC-03 pesquisa por um ingrediente', async () => {
    const { body } = await http().get('/recipes?ingredients=banana').expect(200);
    expect(body.total).toBe(3);
  });
  test('REC-04 vários ingredientes, ranking e duplicatas', async () => {
    const { body } = await http().get('/recipes?ingredients=banana,aveia').expect(200);
    expect(body.total).toBe(3); expect(body.items[0].matched_ingredients).toBe(2);
    expect(body.items[1].matched_ingredients).toBe(2);
    expect(new Set(body.items.map((r) => r.id_receita)).size).toBe(3);
  });
  test('REC-05 filtros combinados e ausência de resultados', async () => {
    const { body } = await http().get('/recipes?name=panqueca&ingredients=aveia').expect(200);
    expect(body.total).toBe(1);
    const empty = await http().get('/recipes?name=nao-existe-9784').expect(200);
    expect(empty.body.items).toEqual([]); expect(empty.body.total).toBe(0);
  });
  test('REC-06 detalhes e ingredientes', async () => {
    const { body } = await http().get('/recipes/1').expect(200);
    expect(body.nome).toBe('Panqueca de banana'); expect(body.ingredientes).toHaveLength(3);
    expect(typeof body.modo_preparo).toBe('string');
    await http().get('/recipes/2147483647').expect(404);
  });
  test('REC-07 parâmetros inválidos 400', async () => {
    await http().get('/recipes?limit=0').expect(400);
    await http().get('/recipes/abc').expect(400);
  });
});
