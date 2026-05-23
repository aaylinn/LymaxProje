import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';

/**
 * AppModule — Uygulamanın kök (root) modülüdür.
 *
 * Bu modül, tüm özellik modüllerini bir araya getirir ve
 * yapılandırma ile veritabanı bağlantısı gibi küresel altyapıyı kurar.
 */
@Module({
  imports: [
    // ─── Yapılandırma ────────────────────────────────────────────────────────
    // .env dosyasındaki değişkenleri ConfigService aracılığıyla
    // tüm uygulamada erişilebilir kılar.
    // isGlobal: true sayesinde her modüle ayrıca import etmeye gerek yoktur.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ─── Veritabanı Bağlantısı ────────────────────────────────────────────────
    // ConfigService'i inject edebilmek için async fabrika yöntemi kullanılır.
    // MONGODB_URI değeri .env dosyasından okunur.
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),

    // ─── Özellik Modülleri ────────────────────────────────────────────────────
    AuthModule,   // Kimlik doğrulama (kayıt/giriş)
    UsersModule,  // Kullanıcı veritabanı işlemleri
    TasksModule,  // Görev CRUD işlemleri
  ],
})
export class AppModule {}
