require('dotenv').config({ path: require('node:path').resolve(__dirname, '../.env') });
const fs = require('node:fs');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const { once } = require('node:events');
const net = require('node:net');
const { validateSql } = require('./validate-sql.cjs');
const root = path.resolve(__dirname, '../..');
const reportDir = path.join(root, 'docs/evidencias', new Date().toISOString().replace(/[:.]/g, '-'));
fs.mkdirSync(reportDir, { recursive: true });
const npmCli = path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
const summary = { startedAt: new Date().toISOString(), node: process.version, platform: process.platform, checks: [] };
const processes = [];
function command(id, directory, args, env = {}) {
  const start = Date.now();
  const result = spawnSync(process.execPath, args, { cwd: path.join(root, directory), env: { ...process.env, NO_COLOR: '1', ...env }, encoding: 'utf8', timeout: 120000 });
  fs.writeFileSync(path.join(reportDir, `${id}.log`), `${result.stdout || ''}\n${result.stderr || ''}`);
  summary.checks.push({ id, command: ['node', ...args.map((arg) => arg === npmCli ? '<npm-cli>' : arg)], directory, exitCode: result.status, durationMs: Date.now() - start, passed: result.status === 0 });
  console.log(`${id}: ${result.status === 0 ? 'APROVADO' : 'FALHOU'}`);
  return result.status === 0;
}
function npm(id, directory, args, env) { return command(id, directory, [npmCli, ...args], env); }
async function startServer(id, directory, args, env, url) {
  const target = new URL(url);
  await new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', () => reject(new Error(`${id}: porta ${target.port} ocupada; nenhum processo existente será interrompido.`)));
    probe.listen(Number(target.port), target.hostname, () => probe.close(resolve));
  });
  const child = spawn(process.execPath, args, { cwd: path.join(root, directory), env: { ...process.env, ...env }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  processes.push(child);
  const log = fs.createWriteStream(path.join(reportDir, `${id}.log`));
  child.stdout.pipe(log, { end: false }); child.stderr.pipe(log, { end: false });
  child.once('close', () => log.end());
  let spawnError; child.once('error', (error) => { spawnError = error; });
  for (let i = 0; i < 50; i++) {
    if (spawnError || child.exitCode !== null) throw new Error(`${id}: servidor não iniciou.`);
    try { const response = await fetch(url, { signal: AbortSignal.timeout(1000) }); if (response.ok) return child; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`${id}: timeout de inicialização.`);
}
async function main() {
  console.log(`Evidências: ${path.relative(root, reportDir)}`);
  const sql = validateSql(reportDir);
  summary.sql = { schema: sql.schema, scripts: sql.entries.length, passed: true };
  console.log('SQL: seis scripts executados no schema isolado.');
  const testEnv = { DATABASE_URL: sql.databaseUrl };
  const backendBuild = npm('backend-build', 'backend', ['run', 'build']);
  const frontendBuild = npm('frontend-build', 'frontend', ['run', 'build'], { VITE_API_URL: 'http://127.0.0.1:3101' });
  if (backendBuild) {
    command('backend-node-tests', 'backend', ['--test', 'test/app.test.cjs', 'test/auth.test.cjs']);
    command('backend-jest', 'backend', ['node_modules/jest/bin/jest.js', '--runInBand', '--json', `--outputFile=${path.join(reportDir, 'backend-jest.json')}`]);
    command('backend-essential-mysql', 'backend', ['node_modules/jest/bin/jest.js', '--runInBand', '--runTestsByPath', 'test/essential-mysql.spec.cjs', '--json', `--outputFile=${path.join(reportDir, 'backend-essential-mysql.json')}`], { ...testEnv, WASFA_MYSQL_TESTS: '1' });
    command('backend-legacy-mysql', 'backend', ['--test', 'test/mysql.test.cjs', 'test/recipes-mysql.test.cjs'], testEnv);
  }
  npm('frontend-tests', 'frontend', ['test', '--', '--reporter=default', '--reporter=json', `--outputFile=${path.join(reportDir, 'frontend-tests.json')}`]);
  summary.audits = {};
  for (const directory of ['backend', 'frontend']) {
    const result = spawnSync(process.execPath, [npmCli, 'audit', '--json'], { cwd: path.join(root, directory), env: process.env, encoding: 'utf8', timeout: 60000 });
    fs.writeFileSync(path.join(reportDir, `${directory}-audit.json`), result.stdout || '{}');
    try {
      const data = JSON.parse(result.stdout);
      summary.audits[directory] = data.metadata?.vulnerabilities ?? { error: 'Auditoria indisponível; consulte o JSON.' };
    } catch { summary.audits[directory] = { error: 'Auditoria não retornou JSON válido.' }; }
  }
  if (backendBuild && frontendBuild) {
    await startServer('production-backend', 'backend', ['dist/main.js'], { ...testEnv, NODE_ENV: 'production', PORT: '3101', CORS_ORIGINS: 'http://127.0.0.1:4175' }, 'http://127.0.0.1:3101/health');
    await startServer('production-preview', 'frontend', ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4175', '--strictPort'], {}, 'http://127.0.0.1:4175');
    npm('frontend-live', 'frontend', ['run', 'test:live', '--', '--reporter=default', '--reporter=json', `--outputFile=${path.join(reportDir, 'frontend-live.json')}`], { VITE_API_URL: 'http://127.0.0.1:3101' });
    const httpChecks = [];
    for (const entry of ['index', 'receitas', 'receita', 'login', 'perfil', 'sobre', 'contato']) {
      const uri = entry === 'index' ? '/index.html' : `/pages/${entry}.html`;
      const response = await fetch(`http://127.0.0.1:4175${uri}`);
      const body = await response.text();
      httpChecks.push({ uri, status: response.status, passed: response.ok && body.includes('id="root"') });
      if (entry === 'index') {
        const asset = body.match(/src="([^"]+\.js)"/);
        if (!asset) throw new Error('Build sem script JavaScript.');
        const result = await fetch(`http://127.0.0.1:4175${asset[1]}`);
        httpChecks.push({ uri: asset[1], status: result.status, passed: result.ok });
      }
    }
    const api = await fetch('http://127.0.0.1:3101/recipes', { headers: { Origin: 'http://127.0.0.1:4175' } });
    httpChecks.push({ uri: 'GET /recipes + CORS', status: api.status, passed: api.ok && api.headers.get('access-control-allow-origin') === 'http://127.0.0.1:4175' });
    summary.productionSimulation = { backendPort: 3101, previewPort: 4175, checks: httpChecks, passed: httpChecks.every((check) => check.passed), note: 'Smoke HTTP local do build; sem deploy ou revisão visual de navegador.' };
    fs.writeFileSync(path.join(reportDir, 'production-http.json'), JSON.stringify(summary.productionSimulation, null, 2));
  }
}
main().catch((error) => { summary.error = error.message; console.error(error.message); process.exitCode = 1; }).finally(async () => {
  for (const child of processes.reverse()) {
    if (child.exitCode === null) {
      child.kill();
      await Promise.race([once(child, 'close'), new Promise((resolve) => setTimeout(resolve, 3000))]);
    }
  }
  summary.finishedAt = new Date().toISOString();
  summary.passed = !summary.error && summary.checks.every((check) => check.passed) && summary.productionSimulation?.passed === true;
  if (!summary.passed) process.exitCode = 1;
  fs.writeFileSync(path.join(reportDir, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log(`Resultado: ${summary.passed ? 'APROVADO' : 'FALHOU'}. Relatório: ${path.relative(root, reportDir)}`);
});
