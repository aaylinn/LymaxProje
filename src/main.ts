import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // ─── Global Ön Ek (Prefix) ────────────────────────────────────────────────
  // Tüm route'lar /api önekiyle başlar. Örnek: /api/auth/giris
  app.setGlobalPrefix('api');

  // ─── Global Doğrulama Borusu (ValidationPipe) ────────────────────────────
  // Gelen her istek gövdesi, otomatik olarak ilgili DTO sınıfına göre doğrulanır.
  // - whitelist      : DTO'da tanımlı olmayan alanları otomatik olarak siler.
  // - forbidNonWhitelisted : Tanımsız alan gönderildiğinde hata fırlatır.
  // - transform      : Gelen veriyi DTO sınıf örneklerine dönüştürür.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ─── CORS Yapılandırması ──────────────────────────────────────────────────
  // Geliştirme ortamında tüm kaynaklara izin verilir.
  // Üretimde yalnızca belirli alan adlarına izin verin.
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? false : '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ─── Swagger / OpenAPI Dokümantasyonu ────────────────────────────────────
  // Erişim adresi: http://localhost:3000/api/docs
  const swaggerYapılandırma = new DocumentBuilder()
    .setTitle('Görev Yönetimi API')
    .setDescription(
      `JWT kimlik doğrulamalı, üretime hazır bir Görev Yönetimi REST API'si.

**Özellikler:**
- JWT tabanlı kimlik doğrulama (kayıt ol & giriş yap)
- Sahiplik denetimli tam CRUD görev yönetimi
- Her kullanıcı yalnızca kendi görevlerine erişebilir`,
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'JWT tokenınızı girin. /api/auth/giris adresinden alabilirsiniz.',
        in: 'header',
      },
      'JWT-auth', // Bu isim, @ApiBearerAuth() dekoratöründeki isimle eşleşmeli
    )
    .addTag('Kimlik Doğrulama', 'Kullanıcı kayıt ve giriş işlemleri')
    .addTag('Görevler', 'Görev CRUD işlemleri (kimlik doğrulama gerektirir)')
    .build();

  const belge = SwaggerModule.createDocument(app, swaggerYapılandırma);
  SwaggerModule.setup('api/docs', app, belge, {
    swaggerOptions: {
      persistAuthorization: true, // Sayfa yenilendiğinde JWT token'ı hatırlar
    },
  });

  // ─── Sunucuyu Başlat ──────────────────────────────────────────────────────
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`🚀 Uygulama çalışıyor: http://localhost:${port}/api`);
  logger.log(`📚 Swagger dokümantasyonu: http://localhost:${port}/api/docs`);
}

bootstrap();
