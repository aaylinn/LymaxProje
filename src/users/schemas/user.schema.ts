import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

/**
 * UserDocument tipi — User sınıfını Mongoose'un Document tipiyle birleştirir.
 * Bu sayede .save(), ._id gibi Mongoose metodlarına erişim sağlanır.
 */
export type UserDocument = User & Document;

/**
 * @Schema — Bu sınıfı bir Mongoose şeması olarak işaretler.
 * - timestamps: true → createdAt ve updatedAt alanlarını otomatik ekler.
 */
@Schema({ timestamps: true })
export class User {
  @ApiProperty({ example: 'ahmet.yilmaz@ornek.com', description: 'Kullanıcının benzersiz e-posta adresi' })
  @Prop({
    required: true,
    unique: true,    // Veritabanı seviyesinde benzersizlik zorunlu
    lowercase: true, // Kayıt öncesi e-posta küçük harfe normalleştirilir
    trim: true,
  })
  email: string;

  @ApiProperty({ example: 'Ahmet Yılmaz', description: 'Kullanıcının görünen adı' })
  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  })
  ad: string;

  // Şifre alanı kasıtlı olarak @ApiProperty ile süslenmemiştir.
  // API yanıtlarında veya Swagger dokümantasyonunda şifrenin görünmesini istemiyoruz.
  @Prop({ required: true })
  sifre: string; // bcrypt hash olarak saklanır, asla düz metin değil
}

/**
 * SchemaFactory — Dekoratörlü sınıfımızdan gerçek Mongoose şemasını oluşturur.
 * Bu şema, UsersModule içinde MongooseModule.forFeature() ile kaydedilir.
 */
export const UserSchema = SchemaFactory.createForClass(User);
