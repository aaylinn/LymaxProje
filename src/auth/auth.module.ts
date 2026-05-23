import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { User, UserSchema } from '../users/schemas/user.schema';

/**
 * AuthModule — Kimlik doğrulamaya ait tüm sağlayıcıları kapsüller.
 *
 * Önemli tasarım kararları:
 * - JwtModule, JWT_SECRET'i ortam değişkeninden okumak için async yapılandırılır.
 * - PassportModule, varsayılan strateji olarak 'jwt'yi ayarlar.
 * - UsersModule, UsersService'e erişmek için import edilir (kullanıcı arama/oluşturma).
 * - User modeli, JwtStrategy'de doğrudan kullanım için de import edilir.
 * - JwtStrategy, Passport'un keşfedebilmesi için provider olarak kaydedilir.
 */
@Module({
  imports: [
    // Kullanıcı işlemleri için UsersService'e erişmek üzere UsersModule'ü import et
    UsersModule,

    // PassportModule, Passport.js'i NestJS'in bağımlılık enjeksiyon sistemine entegre eder
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JwtModule'ü async yapılandır — ConfigService'in ConfigModule'den gelmesi gerekir
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
        },
      }),
    }),

    // JwtStrategy, token doğrulaması için veritabanı sorgusu yapar, bu yüzden User modeline ihtiyacı var
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // JwtStrategy, Passport'un onu bulabilmesi için provider olarak kaydedilmelidir
    JwtStrategy,
  ],
  // PassportModule ve JwtModule dışa aktarılır; böylece TasksModule gibi diğer modüller
  // JwtAuthGuard'ı her şeyi yeniden import etmeden kullanabilir
  exports: [PassportModule, JwtModule, AuthService],
})
export class AuthModule {}
