import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard — Route'ları JWT kimlik doğrulamasıyla koruyan yeniden kullanılabilir bir guard.
 *
 * AuthGuard('jwt')'yi genişleterek bu guard, bir controller veya route'a
 * uygulandığında JwtStrategy'yi otomatik olarak etkinleştirir.
 *
 * Kullanım örnekleri:
 *   @UseGuards(JwtAuthGuard)   ← belirli bir route için
 *   @UseGuards(JwtAuthGuard)   ← controller için (tüm route'ları korur)
 *
 * Token geçersiz veya eksikse Passport otomatik olarak 401 Unauthorized hatası fırlatır.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
