require('reflect-metadata');
require('dotenv/config');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Test } = require('@nestjs/testing');
const request = require('supertest');
const { AppModule } = require('../dist/app.module');
const { readConfig } = require('../dist/config');
const { setupApp } = require('../dist/setup-app');

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
