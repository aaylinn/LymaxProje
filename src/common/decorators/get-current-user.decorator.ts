import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDocument } from '../../users/schemas/user.schema';

/**
 * @MevcutKullanici — İstek nesnesinden kimliği doğrulanmış kullanıcıyı
 * çıkaran özel bir parametre dekoratörüdür.
 *
 * Nasıl çalışır:
 * JwtStrategy.validate() bir kullanıcı belgesi döndürür; Passport bunu
 * request.user'a bağlar. Bu dekoratör, controller metodlarında req.user'a
 * manuel olarak erişmek yerine temiz ve tip-güvenli bir yol sağlar.
 *
 * Kullanım örnekleri:
 *
 *   // Tam kullanıcı nesnesini al
 *   @Get('profilim')
 *   @UseGuards(JwtAuthGuard)
 *   profiliGetir(@MevcutKullanici() kullanici: UserDocument) {
 *     return kullanici;
 *   }
 *
 *   // Yalnızca belirli bir alanı al
 *   @Get('gorevlerim')
 *   @UseGuards(JwtAuthGuard)
 *   gorevleriGetir(@MevcutKullanici('_id') kullaniciId: string) { ... }
 */
export const MevcutKullanici = createParamDecorator(
  (alan: keyof UserDocument | undefined, ctx: ExecutionContext) => {
    // HTTP bağlamına geç ve Express Request nesnesini al
    const istek = ctx.switchToHttp().getRequest();
    const kullanici: UserDocument = istek.user;

    // Belirli bir alan isteniyorsa (örn. @MevcutKullanici('email')),
    // yalnızca o alanı döndür. Aksi takdirde tam kullanıcı nesnesini döndür.
    return alan ? kullanici?.[alan] : kullanici;
  },
);
