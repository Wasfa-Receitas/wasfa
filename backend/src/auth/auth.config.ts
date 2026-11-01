export function readJwtConfig(env: NodeJS.ProcessEnv = process.env) {
  const secret = env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32 || /^(CHANGE|SUBSTITUA|EXEMPLO)/i.test(secret)) {
    throw new Error('JWT_SECRET deve ser uma chave aleatória de pelo menos 32 bytes.');
  }
  const expiresIn = Number(env.JWT_EXPIRES_IN ?? 3600);
  if (!Number.isInteger(expiresIn) || expiresIn < 60 || expiresIn > 86400) {
    throw new Error('JWT_EXPIRES_IN deve ser um inteiro entre 60 e 86400 segundos.');
  }
  return { secret, expiresIn };
}
