require('reflect-metadata');
require('dotenv/config');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Test } = require('@nestjs/testing');
const request = require('supertest');
const { AppModule } = require('../dist/app.module');
const { readConfig } = require('../dist/config');
const { setupApp } = require('../dist/setup-app');
const { PrismaService } = require('../dist/database/prisma.service');
const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('node:crypto');
const argon2 = require('argon2');

test('MySQL real: saúde e consulta de receitas sem escrita', async () => {
  const config = readConfig();
  const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = module.createNestApplication({ logger: false });
  setupApp(app, config.origins);
  await app.init();
  try {
    await request(app.getHttpServer()).get('/health').expect(200);
    await request(app.getHttpServer()).get('/health/db').expect(200)
      .expect({ status: 'ok', database: 'up' });
    const { body } = await request(app.getHttpServer()).get('/receitas').expect(200);
    assert.ok(Array.isArray(body));
    assert.ok(body.length <= 20);
    for (const row of body) {
      assert.deepEqual(Object.keys(row).sort(), ['dificuldade', 'id_receita', 'nome', 'tempo_preparo']);
      assert.equal(typeof row.id_receita, 'number');
      assert.equal(typeof row.nome, 'string');
    }
    console.log(`Leitura real validada: ${body.length} receitas retornadas.`);
  } finally { await app.close(); }
});

test('MySQL real: cadastro, duplicidade, login e me com rollback', async () => {
  const config = readConfig();
  const prisma = new PrismaClient();
  const rollback = new Error('test-rollback');
  try {
    await assert.rejects(prisma.$transaction(async (tx) => {
      const module = await Test.createTestingModule({ imports: [AppModule] })
        .overrideProvider(PrismaService).useValue({ usuarios: tx.usuarios }).compile();
      const app = module.createNestApplication({ logger: false });
      setupApp(app, config.origins);
      await app.init();
      const email = `auth-test-${randomUUID()}@example.com`;
      const senha = randomUUID();
      try {
        const http = () => request(app.getHttpServer());
        const register = await http().post('/auth/register').send({ nome: 'Teste transacional', email, senha }).expect(201);
        const stored = await tx.usuarios.findUnique({ where: { email } });
        assert.ok(stored && await argon2.verify(stored.senha, senha));
        await http().post('/auth/register').send({ nome: 'Duplicado', email, senha }).expect(409);
        const login = await http().post('/auth/login').send({ email, senha }).expect(200);
        await http().get('/auth/me').set('Authorization', `Bearer ${login.body.accessToken}`)
          .expect(200).expect(register.body.usuario);
        await http().get('/auth/me').expect(401);
        await http().post('/auth/login').send({ email, senha: 'incorrect-test-password' }).expect(401);
        console.log('Autenticação MySQL validada em transação revertida.');
      } finally { await app.close(); }
      throw rollback;
    }, { timeout: 30000 }), (error) => error === rollback);
  } finally { await prisma.$disconnect(); }
});
