import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';

/**
 * UsersModule — Kullanıcıya ait tüm mantığı kapsüller.
 *
 * Bu modül:
 * 1. User Mongoose modelini bağımlılık enjeksiyonu için kaydeder.
 * 2. UsersService'i bu modül içinde sağlar (provide eder).
 * 3. UsersService'i dışa aktarır (export), böylece AuthModule kullanabilir.
 */
@Module({
  imports: [
    // User şemasını Mongoose ile kaydeder.
    // MongoDB'de 'users' koleksiyonunu oluşturur.
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersService],
  // UsersService'i dışa aktarmak, UsersModule'ü import eden
  // her modülün bu servisi kullanabilmesini sağlar.
  exports: [UsersService],
})
export class UsersModule {}
