import { ConflictException, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { readJwtConfig } from './auth.config';

const publicUser = { id_usuario: true, nome: true, email: true } as const;
const hashOptions = { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 };

@Injectable()
export class AuthService {
  // Hash de comparação para manter o trabalho criptográfico quando o email não existe.
  private readonly dummyHash = argon2.hash('wasfa-dummy-comparison', hashOptions);
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async register(dto: RegisterDto) {
    const senha = await argon2.hash(dto.senha, hashOptions);
    try {
      // A restrição UNIQUE do MySQL também impede duplicatas em requisições simultâneas.
      const usuario = await this.prisma.usuarios.create({
        data: { nome: dto.nome, email: dto.email, senha }, select: publicUser,
      });
      return this.session(usuario);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email já cadastrado.');
      }
      throw new ServiceUnavailableException('Não foi possível cadastrar o usuário.');
    }
  }

  async login(dto: LoginDto) {
    let usuario;
    try {
      usuario = await this.prisma.usuarios.findUnique({
        where: { email: dto.email }, select: { ...publicUser, senha: true },
      });
    } catch { throw new ServiceUnavailableException('Banco de dados indisponível.'); }
    const storedHash = usuario?.senha;
    // Os marcadores hash_exemplo_* dos scripts não são senhas válidas.
    const validHash = typeof storedHash === 'string' && storedHash.startsWith('$argon2id$');
    let valid = false;
    try {
      valid = await argon2.verify(validHash ? storedHash : await this.dummyHash, dto.senha);
    } catch { /* Hash inválido também retorna credenciais inválidas. */ }
    if (!usuario || !validHash || !valid) throw new UnauthorizedException('Credenciais inválidas.');
    const { senha: _senha, ...safe } = usuario;
    return this.session(safe);
  }

  async me(id: number) {
    let usuario;
    try {
      usuario = await this.prisma.usuarios.findUnique({ where: { id_usuario: id }, select: publicUser });
    } catch { throw new ServiceUnavailableException('Banco de dados indisponível.'); }
    if (!usuario) throw new UnauthorizedException('Usuário não encontrado.');
    return usuario;
  }

  private async session(usuario: { id_usuario: number; nome: string; email: string }) {
    return {
      usuario,
      accessToken: await this.jwt.signAsync({ sub: usuario.id_usuario }),
      tokenType: 'Bearer',
      expiresIn: readJwtConfig().expiresIn,
    };
  }
}
