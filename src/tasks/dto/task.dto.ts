import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { GorevDurumu, GorevOnceligi } from '../schemas/task.schema';

/**
 * GorevOlusturDto — POST /gorevler endpoint'i için istek gövdesini doğrular.
 *
 * Yalnızca 'baslik' zorunludur. Diğer tüm alanlar isteğe bağlıdır ve
 * belirtilmezse şema varsayılan değerlerine döner.
 */
export class GorevOlusturDto {
  @ApiProperty({
    example: 'API dokümantasyonunu tamamla',
    description: 'Görev başlığı (zorunlu, 1-200 karakter).',
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty({ message: 'Görev başlığı boş olamaz.' })
  @MinLength(1)
  @MaxLength(200, { message: 'Başlık en fazla 200 karakter olabilir.' })
  baslik: string;

  @ApiPropertyOptional({
    example: 'Proje için detaylı API dokümantasyonu ve README yaz.',
    description: 'Görevin ayrıntılı açıklaması (isteğe bağlı, en fazla 1000 karakter).',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Açıklama en fazla 1000 karakter olabilir.' })
  aciklama?: string;

  @ApiPropertyOptional({
    enum: GorevDurumu,
    default: GorevDurumu.YAPILACAK,
    description: `Görev durumu. Geçerli değerler: ${Object.values(GorevDurumu).join(', ')}`,
  })
  @IsOptional()
  @IsEnum(GorevDurumu, {
    message: `Durum şunlardan biri olmalıdır: ${Object.values(GorevDurumu).join(', ')}`,
  })
  durum?: GorevDurumu;

  @ApiPropertyOptional({
    enum: GorevOnceligi,
    default: GorevOnceligi.ORTA,
    description: `Görev önceliği. Geçerli değerler: ${Object.values(GorevOnceligi).join(', ')}`,
  })
  @IsOptional()
  @IsEnum(GorevOnceligi, {
    message: `Öncelik şunlardan biri olmalıdır: ${Object.values(GorevOnceligi).join(', ')}`,
  })
  oncelik?: GorevOnceligi;

  @ApiPropertyOptional({
    example: '2024-12-31T23:59:59.000Z',
    description: 'ISO 8601 formatında bitiş tarihi (isteğe bağlı).',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Bitiş tarihi geçerli bir ISO 8601 tarih dizesi olmalıdır.' })
  bitisTarihi?: string;
}

/**
 * GorevGuncelleDto — PUT /gorevler/:id endpoint'i için istek gövdesini doğrular.
 *
 * @nestjs/swagger'dan PartialType, GorevOlusturDto'daki TÜM alanları isteğe bağlı yapar.
 * Bu, PUT/PATCH endpoint'leri için idealdir — kullanıcılar yalnızca güncellemek istedikleri
 * alanları gönderebilir. Aynı zamanda tüm @ApiProperty dekoratörlerini devralır,
 * böylece Swagger bunları isteğe bağlı olarak gösterir.
 */
export class GorevGuncelleDto extends PartialType(GorevOlusturDto) {}
