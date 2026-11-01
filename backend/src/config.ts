export function readConfig(env: NodeJS.ProcessEnv = process.env) {
  const port = Number(env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT deve ser um inteiro entre 1 e 65535.');
  }
  if (!env.DATABASE_URL) throw new Error('Configure DATABASE_URL no arquivo .env.');
  try {
    const url = new URL(env.DATABASE_URL);
    if (url.protocol !== 'mysql:' || !url.hostname || url.pathname.length < 2) throw new Error();
  } catch {
    throw new Error('DATABASE_URL deve ser uma URL MySQL com nome do banco.');
  }
  const origins = (env.CORS_ORIGINS ?? 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',').map((origin) => origin.trim()).filter(Boolean);
  if (!origins.length || origins.some((origin) => {
    try {
      const url = new URL(origin);
      return !['http:', 'https:'].includes(url.protocol) || url.origin !== origin;
    } catch { return true; }
  })) throw new Error('CORS_ORIGINS deve conter origens HTTP/HTTPS separadas por vírgula.');
  return { port, origins };
}
