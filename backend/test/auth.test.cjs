require('reflect-metadata');
process.env.JWT_SECRET = 'test-only-key-not-for-production-1234567890';
process.env.JWT_EXPIRES_IN = '3600';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Test } = require('@nestjs/testing');
const { JwtService } = require('@nestjs/jwt');
const { Prisma } = require('@prisma/client');
const argon2 = require('argon2');
const request = require('supertest');
const { AppModule } = require('../dist/app.module');
const { PrismaService } = require('../dist/database/prisma.service');
const { setupApp } = require('../dist/setup-app');
const { readJwtConfig } = require('../dist/auth/auth.config');

test('configuração JWT rejeita chave ausente, curta e expiração inválida', () => {
  assert.throws(() => readJwtConfig({}), /JWT_SECRET/);
  assert.throws(() => readJwtConfig({ JWT_SECRET: 'short' }), /JWT_SECRET/);
  assert.throws(() => readJwtConfig({ JWT_SECRET: process.env.JWT_SECRET, JWT_EXPIRES_IN: '0' }), /JWT_EXPIRES_IN/);
});

test('cadastro, login, validação, duplicidade concorrente e acesso protegido HTTP', async () => {
  const users = [];
  let offline = false;
  const fake = { usuarios: {
    create: async ({ data, select }) => {
      if (offline) throw new Error('private-db-details');
      if (users.some((u) => u.email === data.email)) throw new Prisma.PrismaClientKnownRequestError('duplicate', { code: 'P2002', clientVersion: '6.19.0' });
      const user = { id_usuario: users.length + 1, ...data };
      users.push(user);
      return project(user, select);
    },
    findUnique: async ({ where, select }) => {
      if (offline) throw new Error('private-db-details');
      return project(users.find((u) => where.email ? u.email === where.email : u.id_usuario === where.id_usuario), select);
    },
  } };
  function project(user, select) {
    return user ? Object.fromEntries(Object.keys(select).filter((key) => select[key]).map((key) => [key, user[key]])) : null;
  }
  const module = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService).useValue(fake).compile();
  const app = module.createNestApplication({ logger: false });
  setupApp(app, ['http://localhost:5173']);
  await app.init();
  const http = () => request(app.getHttpServer());
  const credentials = { email: 'maria@example.com', senha: 'Test-password-123!' };
  const safe = { id_usuario: 1, nome: 'Maria', email: credentials.email };
  const jwt = module.get(JwtService);
  try {
    for (const payload of [
      {}, { nome: ' ', ...credentials }, { nome: 'Maria', ...credentials, email: 'invalid' },
      { nome: 'Maria', ...credentials, senha: 'short' },
      { nome: 'Maria', ...credentials, senha: 12345678 },
      { nome: 'Maria', ...credentials, role: 'admin' },
      { nome: 'Maria', ...credentials, senha: 'a'.repeat(129) },
    ]) await http().post('/auth/register').send(payload).expect(400);
    const registered = await http().post('/auth/register').send({ nome: ' Maria ', ...credentials, email: ' MARIA@example.com ' }).expect(201);
    assert.deepEqual(registered.body.usuario, safe);
    assert.equal(registered.body.tokenType, 'Bearer');
    assert.equal(registered.body.expiresIn, 3600);
    assert.equal('senha' in registered.body.usuario, false);
    assert.ok(users[0].senha.startsWith('$argon2id$'));
    assert.notEqual(users[0].senha, credentials.senha);
    assert.ok(await argon2.verify(users[0].senha, credentials.senha));
    await http().post('/auth/register').send({ nome: 'Maria', ...credentials }).expect(409);
    const raced = await Promise.all([1, 2].map(() => http().post('/auth/register').send({ nome: 'Outra', email: 'race@example.com', senha: credentials.senha })));
    assert.deepEqual(raced.map((r) => r.status).sort(), [201, 409]);
    const logged = await http().post('/auth/login').send(credentials).expect(200);
    assert.deepEqual(logged.body.usuario, safe);
    const token = logged.body.accessToken;
    const payload = await jwt.verifyAsync(token);
    assert.equal(payload.sub, 1);
    assert.equal('senha' in payload, false);
    await http().get('/auth/me').set('Authorization', `Bearer ${token}`).expect(200).expect(safe);
    await http().get('/auth/me').expect(401);
    for (const header of ['Basic abc', 'Bearer invalid', `Bearer ${token} extra`, `Bearer ${token.slice(0, -5)}xxxxx`]) {
      await http().get('/auth/me').set('Authorization', header).expect(401);
    }
    for (const invalidToken of [
      await jwt.signAsync({ sub: 1 }, { expiresIn: -1 }),
      await jwt.signAsync({ sub: 1 }, { secret: 'another-test-secret-key' }),
      await jwt.signAsync({ sub: 1 }, { audience: 'other' }),
      await jwt.signAsync({ sub: '1' }),
      await jwt.signAsync({ sub: 999 }),
    ]) await http().get('/auth/me').set('Authorization', `Bearer ${invalidToken}`).expect(401);
    const wrong = await http().post('/auth/login').send({ ...credentials, senha: 'wrong-password' }).expect(401);
    const absent = await http().post('/auth/login').send({ ...credentials, email: 'missing@example.com' }).expect(401);
    assert.deepEqual(wrong.body, absent.body);
    users.push({ id_usuario: 3, nome: 'Seed', email: 'seed@example.com', senha: 'hash_exemplo_1' });
    await http().post('/auth/login').send({ email: 'seed@example.com', senha: 'hash_exemplo_1' }).expect(401);
    await http().post('/auth/login').send({ ...credentials, email: 123 }).expect(400);
    const preflight = await http().options('/auth/login').set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST').set('Access-Control-Request-Headers', 'authorization,content-type').expect(204);
    assert.ok(preflight.headers['access-control-allow-methods'].includes('POST'));
    offline = true;
    for (const response of [
      await http().post('/auth/login').send(credentials).expect(503),
      await http().post('/auth/register').send({ nome: 'Maria', ...credentials }).expect(503),
      await http().get('/auth/me').set('Authorization', `Bearer ${token}`).expect(503),
    ]) assert.ok(!JSON.stringify(response.body).includes('private-db-details'));
  } finally { await app.close(); }
});
