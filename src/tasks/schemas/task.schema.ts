import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/schemas/user.schema';

export type GorevDocument = Gorev & Document;

/**
 * GorevDurumu Enum — Durum alanını önceden tanımlanmış değerlerle sınırlar.
 * Düz string yerine enum kullanmak, şema seviyesinde geçersiz veri girişini engeller.
 */
export enum GorevDurumu {
  YAPILACAK = 'YAPILACAK',
  DEVAM_EDIYOR = 'DEVAM_EDIYOR',
  TAMAMLANDI = 'TAMAMLANDI',
}

/**
 * GorevOnceligi Enum — Görevin aciliyet seviyesini tanımlar.
 */
export enum GorevOnceligi {
  DUSUK = 'DUSUK',
  ORTA = 'ORTA',
  YUKSEK = 'YUKSEK',
}

/**
 * @Schema — MongoDB'deki Görev belge yapısını tanımlar.
 * 'sahip' (owner) alanı, User koleksiyonuna bir referans (yabancı anahtar eşdeğeri) oluşturur
 * ve sahipliğe dayalı erişim denetimini mümkün kılar.
 */
@Schema({ timestamps: true })
export class Gorev {
  @ApiProperty({ example: 'API dokümantasyonunu tamamla', description: 'Görevin başlığı' })
  @Prop({
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 200,
  })
  baslik: string;

  @ApiProperty({
    example: 'Proje için detaylı API dokümantasyonu ve README yaz.',
    description: 'Görevin isteğe bağlı ayrıntılı açıklaması',
    required: false,
  })
  @Prop({ trim: true, maxlength: 1000, default: '' })
  aciklama: string;

  @ApiProperty({
    enum: GorevDurumu,
    default: GorevDurumu.YAPILACAK,
    description: 'Görevin mevcut durumu',
  })
  @Prop({
    type: String,
    enum: Object.values(GorevDurumu),
    default: GorevDurumu.YAPILACAK,
  })
  durum: GorevDurumu;

  @ApiProperty({
    enum: GorevOnceligi,
    default: GorevOnceligi.ORTA,
    description: 'Görevin öncelik seviyesi',
  })
  @Prop({
    type: String,
    enum: Object.values(GorevOnceligi),
    default: GorevOnceligi.ORTA,
  })
  oncelik: GorevOnceligi;

  @ApiProperty({
    example: '2024-12-31T23:59:59.000Z',
    description: 'Görev için isteğe bağlı bitiş tarihi',
    required: false,
  })
  @Prop({ type: Date, default: null })
  bitisTarihi: Date;

  /**
   * sahip — Bu görevi oluşturan kullanıcıya referans verir.
   *
   * Sahipliğe dayalı güvenlik modelimizin temel taşıdır.
   * - type: Types.ObjectId → Mongoose'a bunun referans olduğunu söyler
   * - ref: 'User'       → .populate('sahip') ile tam kullanıcı belgesini çekmeyi sağlar
   * - required: true    → Her görev mutlaka bir kullanıcıya ait olmalı
   * - index: true       → "sahip = X olan tüm görevleri bul" sorgularını hızlandırır
   */
  @ApiProperty({
    example: '64a9f8b2c3d4e5f6a7b8c9d0',
    description: 'Bu göreve sahip kullanıcının MongoDB ObjectId değeri',
  })
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  sahip: Types.ObjectId;
}

export const GorevSchema = SchemaFactory.createForClass(Gorev);
