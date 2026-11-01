require('reflect-metadata');
require('dotenv/config');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Test } = require('@nestjs/testing');
const request = require('supertest');
const { AppModule } = require('../dist/app.module');
const { PrismaService } = require('../dist/database/prisma.service');
const { readConfig } = require('../dist/config');
const { setupApp } = require('../dist/setup-app');

test('MySQL real: listagem, pesquisa, relevância, paginação e detalhes somente com leituras', async () => {
  const config = readConfig();
  const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = module.createNestApplication({ logger: false });
  setupApp(app, config.origins);
  await app.init();
  try {
    const prisma = module.get(PrismaService);
    const baseline = await prisma.receitas.findMany({ include: {
      receita_ingredientes: { include: { ingredientes: true } },
    } });
    assert.ok(baseline.length > 0, 'A base deve conter receitas para esta verificação.');
    const http = () => request(app.getHttpServer());
    for (const filters of [
      {}, { name: 'banana' }, { ingredients: 'banana' },
      { ingredients: 'banana,aveia' }, { name: 'banana', ingredients: 'aveia' },
      { ingredients: ' Banana, , aveia,banana, ' }, { ingredients: ' , , ' },
      { name: 'wasfa-inexistente-985734' }, { name: '%_!' },
    ]) {
      const terms = [...new Set((filters.ingredients ?? '').split(',').map((term) => term.trim().toLowerCase()).filter(Boolean))];
      const expected = baseline.map((r) => ({ ...r, score: terms.filter((term) => r.receita_ingredientes.some((ri) => ri.ingredientes.nome.toLowerCase().includes(term))).length }))
        .filter((r) => (!filters.name || r.nome.toLowerCase().includes(filters.name)) && (!terms.length || r.score > 0))
        .sort((a, b) => b.score - a.score || a.id_receita - b.id_receita);
      const response = await http().get('/recipes').query({ ...filters, limit: 100 }).expect(200);
      assert.equal(response.body.total, expected.length);
      assert.deepEqual(response.body.items.map((r) => [r.id_receita, r.matched_ingredients]), expected.slice(0, 100).map((r) => [r.id_receita, r.score]));
      assert.equal(new Set(response.body.items.map((r) => r.id_receita)).size, response.body.items.length);
    }
    const ranked = await http().get('/recipes?ingredients=banana,aveia&limit=100').expect(200);
    assert.ok(ranked.body.items.some((r) => r.matched_ingredients === 2), 'Esperada receita com banana e aveia dos scripts SQL.');
    const page = await http().get('/recipes?ingredients=banana,aveia&page=2&limit=1').expect(200);
    assert.deepEqual(page.body.items, ranked.body.items.slice(1, 2));
    const detail = await http().get(`/recipes/${baseline[0].id_receita}`).expect(200);
    assert.equal(detail.body.nome, baseline[0].nome);
    assert.equal(detail.body.ingredientes.length, baseline[0].receita_ingredientes.length);
    assert.equal('descricao' in detail.body, false);
    await http().get('/recipes/2147483647').expect(404);
    await http().get('/recipes?limit=0').expect(400);
    await http().get('/recipes/').expect(200);
    console.log(`Pesquisa validada sobre ${baseline.length} receitas reais, sem escrita no banco.`);
  } finally { await app.close(); }
});
