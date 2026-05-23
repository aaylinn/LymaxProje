NestJS, TypeScript ve MongoDB ile geliştirilmiştir, JWT kimlik doğrulaması ve sahipliğe dayalı erişim denetimi içeren RESTful API.

## Özellikler

- JWT Kimlik Doğrulama — Passport.js ile güvenli kayıt ve giriş
- -Tam Görev CRUD — Görev oluşturma, listeleme, güncelleme ve silme
- Sahiplik Denetim — Kullanıcılar yalnızca kendi görevlerine erişebilir
- İstek Doğrulama — `class-validator` ile otomatik DTO doğrulaması
- 
## Komutlar

```bash
npm run build        # TypeScript'i dist/ klasörüne derle
npm run start:prod   # Derlenmiş üretim yapısını çalıştır
npm run lint         # ESLint ile otomatik düzeltme
npm run format       # Prettier ile biçimlendirme
```
---

