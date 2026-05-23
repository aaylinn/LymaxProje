import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * KullaniciOlusturDto — Kullanıcı kaydı için Veri Transfer Nesnesi (DTO).
 *
 * class-validator dekoratörleri gelen veriye kural uygular.
 * main.ts'teki GlobalValidationPipe, her istek gövdesini bu DTO'ya göre
 * otomatik olarak doğrular.
 */
export class KullaniciOlusturDto {
  @ApiProperty({
    example: 'ahmet.yilmaz@ornek.com',
    description: 'Geçerli ve benzersiz bir e-posta adresi.',
  })
  @IsEmail({}, { message: 'Lütfen geçerli bir e-posta adresi girin.' })
  @IsNotEmpty({ message: 'E-posta adresi boş olamaz.' })
  email: string;

  @ApiProperty({
    example: 'Ahmet Yılmaz',
    description: 'Kullanıcının tam adı.',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'Ad alanı boş olamaz.' })
  @MinLength(2, { message: 'Ad en az 2 karakter olmalıdır.' })
  @MaxLength(50, { message: 'Ad en fazla 50 karakter olabilir.' })
  ad: string;

  @ApiProperty({
    example: 'Sifre@123',
    description: 'Hesap şifresi (en az 6 karakter).',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'Şifre alanı boş olamaz.' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır.' })
  sifre: string;
}
