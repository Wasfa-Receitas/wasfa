const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

function validateSql(reportDir) {
  const root = path.resolve(__dirname, '../..');
  const url = new URL(process.env.DATABASE_URL);
  const mysql = process.env.MYSQL_BIN || (process.platform === 'win32'
    ? 'C:/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe' : 'mysql');
  const schema = `wasfa_homolog_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const args = ['--protocol=TCP', '--default-character-set=utf8mb4', '--batch',
    '--host', url.hostname, '--port', url.port || '3306', '--user', decodeURIComponent(url.username)];
  const env = { ...process.env, MYSQL_PWD: decodeURIComponent(url.password) };
  const entries = [];
  const transcript = [];
  function execute(label, sql) {
    const result = spawnSync(mysql, args, { input: sql, encoding: 'utf8', env, timeout: 30000 });
    transcript.push(`\n### ${label}\n${result.stdout || ''}${result.stderr || ''}`);
    fs.writeFileSync(path.join(reportDir, 'sql-execution.log'), transcript.join('\n'));
    if (result.error || result.status !== 0) throw new Error(`SQL falhou em ${label}; consulte sql-execution.log.`);
    return result.stdout.trim();
  }
  const order = ['schema.sql', 'inserts.sql', 'functions.sql', 'procedures.sql', 'views.sql', 'consultas.sql'];
  for (const file of order) {
    const original = fs.readFileSync(path.join(root, 'database', file));
    const sha256 = crypto.createHash('sha256').update(original).digest('hex');
    // Apenas o destino é alterado na cópia em memória. Os seis arquivos permanecem intactos.
    const sql = original.toString('utf8').replace(/\b(CREATE DATABASE IF NOT EXISTS|USE)\s+wasfa\b/gi, `$1 \`${schema}\``);
    execute(file, sql);
    entries.push({ file, sha256, status: 'passed' });
  }
  function assertScalar(label, sql, expected) {
    const output = execute(label, `USE \`${schema}\`; ${sql}`);
    const actual = output.split(/\r?\n/).at(-1);
    if (actual !== String(expected)) throw new Error(`${label}: esperado ${expected}, obtido ${actual}.`);
  }
  assertScalar('usuarios', 'SELECT COUNT(*) FROM usuarios;', 3);
  assertScalar('receitas', 'SELECT COUNT(*) FROM receitas;', 10);
  assertScalar('ingredientes', 'SELECT COUNT(*) FROM ingredientes;', 20);
  assertScalar('associacoes', 'SELECT COUNT(*) FROM receita_ingredientes;', 32);
  assertScalar('function', 'SELECT fn_total_ingredientes(1);', 3);
  assertScalar('view-resumo', 'SELECT COUNT(*) FROM vw_resumo_receitas;', 10);
  assertScalar('view-ingredientes', 'SELECT COUNT(*) FROM vw_ingredientes_receitas;', 32);
  const ingredients = execute('procedure-listar', `USE \`${schema}\`; CALL sp_listar_ingredientes(1);`);
  if (ingredients.split(/\r?\n/).length !== 4) throw new Error('Procedure deveria retornar três ingredientes.');
  const creation = execute('procedure-cadastrar-rollback', `USE \`${schema}\`; START TRANSACTION;
    CALL sp_cadastrar_receita('Receita homologacao', 'Misture.', 10, 'Facil');
    SELECT COUNT(*) AS created FROM receitas WHERE nome='Receita homologacao'; ROLLBACK;
    SELECT COUNT(*) AS after_rollback FROM receitas;`);
  if (creation.replace(/\r/g, '') !== 'created\n1\nafter_rollback\n10') throw new Error('Procedure de cadastro ou rollback não conferem.');
  const version = execute('servidor', 'SELECT VERSION() AS mysql_version;');
  const engines = execute('engines', `SELECT TABLE_NAME, ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA='${schema}' AND TABLE_TYPE='BASE TABLE';`);
  if (engines.split(/\r?\n/).slice(1).some((line) => !line.endsWith('\tInnoDB'))) throw new Error('São necessárias tabelas InnoDB.');
  const result = { schema, version, entries, seed: { usuarios: 3, receitas: 10, ingredientes: 20, associacoes: 32 },
    note: 'Somente CREATE DATABASE/USE foram redirecionados em memória. Schema isolado mantido para inspeção; banco original não alterado.' };
  fs.writeFileSync(path.join(reportDir, 'sql-validation.json'), JSON.stringify(result, null, 2));
  const testUrl = new URL(url); testUrl.pathname = `/${schema}`;
  return { ...result, databaseUrl: testUrl.toString() };
}
module.exports = { validateSql };
