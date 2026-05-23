import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';

/**
 * JwtYuku arayüzü — JWT token'ına kodlanan verinin şeklini tanımlar.
 * Token'da yalnızca hassas olmayan, kimlik belirleyici bilgiler saklanır.
 */
export interface JwtYuku {
  sub: string;   // Konu (Subject): kullanıcının MongoDB ObjectId'si (endüstri standardı talep)
  email: string;
}

/**
 * JwtStrategy — Korunan route'larda gelen JWT token'larını doğrular.
 *
 * Nasıl çalışır:
 * 1. JwtAuthGuard, korunan route'larda bu stratejiyi etkinleştirir.
 * 2. passport-jwt, token'ı Authorization: Bearer başlığından çıkarır.
 * 3. JWT_SECRET kullanarak token imzasını doğrular.
 * 4. Çözümlenen yük (payload), validate() metoduna iletilir.
 * 5. validate()'in dönüş değeri, request.user'a bağlanır.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name) private readonly kullaniciModeli: Model<UserDocument>,
  ) {
    super({
      // JWT'yi Authorization: Bearer <token> başlığından çıkar
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Süresi dolmuş token'ları otomatik olarak reddet
      ignoreExpiration: false,
      // Token'ı imzalamak için kullanılan gizli anahtar
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * passport-jwt, token'ın imzasını ve süresini doğruladıktan sonra çağrılır.
   * Kullanıcının hâlâ mevcut olup olmadığını kontrol etmek için ek bir
   * veritabanı sorgusu yapılır. Bu, stratejiyi durumsal (stateful) ve daha güvenli kılar.
   *
   * @param yuk — Çözümlenen JWT yükü
   * @returns req.user'a bağlanacak kullanıcı belgesi
   */
  async validate(yuk: JwtYuku): Promise<UserDocument> {
    const { sub: kullaniciId } = yuk;

    const kullanici = await this.kullaniciModeli.findById(kullaniciId).exec();

    if (!kullanici) {
      throw new UnauthorizedException('Bu token ile ilişkili kullanıcı artık mevcut değil.');
    }

    // Dönen nesne, Request nesnesine req.user olarak bağlanır
    return kullanici;
  }
}
