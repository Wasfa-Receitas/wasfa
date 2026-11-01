require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Test } = require('@nestjs/testing');
const request = require('supertest');
const { AppModule } = require('../dist/app.module');
const { PrismaService } = require('../dist/database/prisma.service');
const { readConfig } = require('../dist/config');
const { setupApp } = require('../dist/setup-app');

test('valida ambiente sem expor credenciais', () => {
  assert.throws(() => readConfig({}), /DATABASE_URL/);
  assert.throws(() => readConfig({ DATABASE_URL: 'invalid' }), /URL MySQL/);
  assert.throws(() => readConfig({ DATABASE_URL: 'mysql://x:y@localhost/wasfa', PORT: '0' }), /PORT/);
  assert.throws(() => readConfig({ DATABASE_URL: 'mysql://x:y@localhost/wasfa', CORS_ORIGINS: '*' }), /CORS_ORIGINS/);
  assert.equal(readConfig({ DATABASE_URL: 'mysql://x:y@localhost/wasfa' }).port, 3000);
});

test('HTTP: saúde, leitura, CORS e falhas de banco', async () => {
  let failure = false;
  let calls = 0;
  const rows = [{ id_receita: 1, nome: 'Panqueca', tempo_preparo: 15, dificuldade: 'Facil' }];
  const fake = {
    $queryRaw: async () => { if (failure) throw new Error('mysql://private:secret@host'); return [{ result: 1 }]; },
    receitas: { findMany: async (query) => {
      calls++;
      assert.equal(query.take, 20);
      assert.deepEqual(query.orderBy, { id_receita: 'asc' });
      assert.equal(query.select.nome, true);
      if (failure) throw new Error('mysql://private:secret@host');
      return rows;
    } },
  };
  const module = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService).useValue(fake).compile();
  const app = module.createNestApplication({ logger: false });
  setupApp(app, ['http://localhost:5173']);
  await app.init();
  try {
    await request(app.getHttpServer()).get('/health').expect(200)
      .expect({ status: 'ok', service: 'wasfa-backend' });
    assert.equal(calls, 0);
    await request(app.getHttpServer()).get('/health/db').expect(200)
      .expect({ status: 'ok', database: 'up' });
    await request(app.getHttpServer()).get('/receitas').expect(200).expect(rows);
    const allowed = await request(app.getHttpServer()).get('/health').set('Origin', 'http://localhost:5173');
    assert.equal(allowed.headers['access-control-allow-origin'], 'http://localhost:5173');
    const denied = await request(app.getHttpServer()).get('/health').set('Origin', 'https://other.example');
    assert.equal(denied.headers['access-control-allow-origin'], undefined);
    await request(app.getHttpServer()).options('/receitas')
      .set('Origin', 'http://localhost:5173').set('Access-Control-Request-Method', 'GET').expect(204);
    failure = true;
    for (const path of ['/health/db', '/receitas']) {
      const response = await request(app.getHttpServer()).get(path).expect(503);
      assert.ok(!JSON.stringify(response.body).includes('secret'));
    }
    await request(app.getHttpServer()).get('/health').expect(200);
    await request(app.getHttpServer()).post('/receitas').expect(404);
  } finally { await app.close(); }
});
