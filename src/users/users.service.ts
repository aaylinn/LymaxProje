import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { KullaniciOlusturDto } from './dto/create-user.dto';

/**
 * UsersService — Kullanıcılarla ilgili tüm iş mantığını yönetir.
 *
 * Bu servis, AuthService tarafından kullanıcı oluşturma ve sorgulama için kullanılır.
 * User modeline ait tüm doğrudan veritabanı etkileşimlerini kapsüller.
 * Bu yaklaşım Tek Sorumluluk İlkesi'ni (Single Responsibility Principle) destekler.
 */
@Injectable()
export class UsersService {
  // TUZLAMA_TURU: bcrypt hash maliyetini belirler.
  // 10, güvenlik ve performans arasında iyi bir denge sağlar.
  private readonly TUZLAMA_TURU = 10;

  constructor(
    // @InjectModel, NestJS'in bağımlılık enjeksiyon konteyneri aracılığıyla
    // User şeması için Mongoose Modelini enjekte eder.
    @InjectModel(User.name) private readonly kullaniciModeli: Model<UserDocument>,
  ) {}

  /**
   * Şifresi hashlenmiş yeni bir kullanıcı oluşturur.
   * E-posta zaten kayıtlıysa ConflictException (409) fırlatır.
   */
  async olustur(dto: KullaniciOlusturDto): Promise<UserDocument> {
    const { email, sifre, ad } = dto;

    // Şifreyi kaydetmeden önce hashleyin. bcrypt asenkron ve engellemesizdir.
    const hashlenmisSifre = await bcrypt.hash(sifre, this.TUZLAMA_TURU);

    try {
      const yeniKullanici = new this.kullaniciModeli({
        email,
        ad,
        sifre: hashlenmisSifre,
      });
      return await yeniKullanici.save();
    } catch (hata) {
      // MongoDB tekrar eden anahtar hata kodu
      if (hata.code === 11000) {
        throw new ConflictException('Bu e-posta adresiyle kayıtlı bir kullanıcı zaten mevcut.');
      }
      throw new InternalServerErrorException('Kullanıcı oluşturulamadı. Lütfen tekrar deneyin.');
    }
  }

  /**
   * E-posta adresine göre kullanıcıyı bulur.
   * Şifre hash'i dahil tam kullanıcı belgesini döner.
   * Bu kasıtlıdır — AuthService, şifreyi doğrulamak için hash'e ihtiyaç duyar.
   * Şifre, API yanıtlarında başka yerlerde dışarıda bırakılır (bkz. AuthService.girisYap).
   */
  async emailIleBul(email: string): Promise<UserDocument | null> {
    return this.kullaniciModeli.findOne({ email: email.toLowerCase() }).exec();
  }

  /**
   * MongoDB ObjectId'sine göre kullanıcıyı bulur.
   * JwtStrategy tarafından token doğrulaması ve isteğe kullanıcı eklenmesi için kullanılır.
   */
  async idIleBul(id: string): Promise<UserDocument | null> {
    return this.kullaniciModeli.findById(id).exec();
  }
}
