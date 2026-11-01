import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const header = request.headers.authorization;
    if (typeof header !== 'string') throw new UnauthorizedException('Token ausente ou inválido.');
    const match = /^Bearer ([^\s]+)$/i.exec(header);
    if (!match) throw new UnauthorizedException('Token ausente ou inválido.');
    try {
      const payload = await this.jwt.verifyAsync(match[1], {
        algorithms: ['HS256'], issuer: 'wasfa-backend', audience: 'wasfa',
      });
      if (!Number.isSafeInteger(payload.sub) || payload.sub <= 0 || !Number.isInteger(payload.exp)) throw new Error();
      request.authUserId = payload.sub;
      return true;
    } catch { throw new UnauthorizedException('Token ausente ou inválido.'); }
  }
}
