import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * KayitDto — POST /auth/kayit endpoint'i için Veri Transfer Nesnesi.
 * Yeni kullanıcı hesabı oluşturmak için gereken doğrulama kurallarını içerir.
 */
export class KayitDto {
  @ApiProperty({
    example: 'ahmet.yilmaz@ornek.com',
    description: 'Yeni hesap için geçerli ve benzersiz bir e-posta adresi.',
  })
  @IsEmail({}, { message: 'Lütfen geçerli bir e-posta adresi girin.' })
  @IsNotEmpty({ message: 'E-posta adresi boş olamaz.' })
  email: string;

  @ApiProperty({
    example: 'Ahmet Yılmaz',
    description: 'Hesapta görünecek tam ad.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Ad alanı boş olamaz.' })
  ad: string;

  @ApiProperty({
    example: 'Sifre@123',
    description: 'Hesap şifresi. En az 6 karakter olmalıdır.',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'Şifre alanı boş olamaz.' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır.' })
  sifre: string;
}

/**
 * GirisDto — POST /auth/giris endpoint'i için Veri Transfer Nesnesi.
 */
export class GirisDto {
  @ApiProperty({
    example: 'ahmet.yilmaz@ornek.com',
    description: 'Kayıtlı e-posta adresi.',
  })
  @IsEmail({}, { message: 'Lütfen geçerli bir e-posta adresi girin.' })
  @IsNotEmpty({ message: 'E-posta adresi boş olamaz.' })
  email: string;

  @ApiProperty({
    example: 'Sifre@123',
    description: 'Hesap şifresi.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Şifre alanı boş olamaz.' })
  sifre: string;
}
