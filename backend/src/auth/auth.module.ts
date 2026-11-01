import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../database/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { readJwtConfig } from './auth.config';

@Module({
  imports: [DatabaseModule, JwtModule.registerAsync({
    useFactory: () => {
      const { secret, expiresIn } = readJwtConfig();
      return { secret, signOptions: { algorithm: 'HS256', expiresIn, issuer: 'wasfa-backend', audience: 'wasfa' } };
    },
  })],
  controllers: [AuthController], providers: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
