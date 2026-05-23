import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { KayitDto, GirisDto } from './dto/auth.dto';
import { UserDocument } from '../users/schemas/user.schema';

/**
 * KimlikDogrulamaYaniti — Başarılı kayıt veya girişten sonra
 * döndürülen yanıtın şeklini tanımlar.
 */
export interface KimlikDogrulamaYaniti {
  erisimToken: string;
  kullanici: {
    id: string;
    email: string;
    ad: string;
  };
}

/**
 * AuthService — Tüm kimlik doğrulama iş mantığını yönetir.
 *
 * Sorumluluklar:
 * - Kullanıcı kaydı (kullanıcı oluşturmayı UsersService'e devreder)
 * - Kimlik bilgisi doğrulama (giriş)
 * - JWT token üretimi
 *
 * Bu servis, Tek Sorumluluk İlkesi'ne (SRP) uygun olarak yalnızca
 * kimlik doğrulama kaygılarını yönetir; kullanıcı veri erişimini
 * UsersService'e devreder.
 */
@Injectable()
export class AuthService {
  constructor(
    // UsersService'i enjekte ediyoruz (Model'i doğrudan değil).
    // Bu, modül sınırlarına ve Bağımlılığı Tersine Çevirme İlkesi'ne uygun.
    private readonly kullaniciServis: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Yeni bir kullanıcı kaydeder ve hemen JWT token döner.
   * Böylece kullanıcı kayıt sonrası otomatik olarak giriş yapmış olur.
   */
  async kayitOl(kayitDto: KayitDto): Promise<KimlikDogrulamaYaniti> {
    // Kullanıcı oluşturmayı (şifre hashleme dahil) UsersService'e devret
    const kullanici = await this.kullaniciServis.olustur(kayitDto);
    return this.kimlikDogrulamaYanitiOlustur(kullanici);
  }

  /**
   * Kullanıcı kimlik bilgilerini doğrular ve başarı durumunda JWT token döner.
   * Kimlik bilgileri geçersizse UnauthorizedException fırlatır.
   */
  async girisYap(girisDto: GirisDto): Promise<KimlikDogrulamaYaniti> {
    const { email, sifre } = girisDto;

    // Adım 1: Kullanıcıyı e-posta ile bul
    const kullanici = await this.kullaniciServis.emailIleBul(email);

    if (!kullanici) {
      // Kullanıcı sayım saldırılarını (user enumeration) önlemek için genel mesaj kullan
      throw new UnauthorizedException('Geçersiz e-posta adresi veya şifre.');
    }

    // Adım 2: Gönderilen düz metin şifreyi saklanan hash ile karşılaştır
    const sifreGecerliMi = await bcrypt.compare(sifre, kullanici.sifre);

    if (!sifreGecerliMi) {
      throw new UnauthorizedException('Geçersiz e-posta adresi veya şifre.');
    }

    return this.kimlikDogrulamaYanitiOlustur(kullanici);
  }

  /**
   * Özel yardımcı metod: JWT token üretir ve kimlik doğrulama yanıtını biçimlendirir.
   * kayitOl() ve girisYap() arasında kod tekrarını önlemek için ayrı bir metoda alındı.
   *
   * @param kullanici — MongoDB'den gelen kimliği doğrulanmış kullanıcı belgesi
   */
  private kimlikDogrulamaYanitiOlustur(kullanici: UserDocument): KimlikDogrulamaYaniti {
    // JWT yükü — minimal tutun (yalnızca hassas olmayan veriler)
    const yuk = {
      sub: kullanici._id.toString(), // 'sub' standart JWT konu talebidir
      email: kullanici.email,
    };

    const erisimToken = this.jwtService.sign(yuk);

    return {
      erisimToken,
      // Yanıt için kullanıcı nesnesini şekillendir, şifreyi açıkça DIŞLA
      kullanici: {
        id: kullanici._id.toString(),
        email: kullanici.email,
        ad: kullanici.ad,
      },
    };
  }
}
