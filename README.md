# 📋 Görev Yönetimi API

**NestJS**, **TypeScript** ve **MongoDB** ile geliştirilmiş; JWT kimlik doğrulaması, sahipliğe dayalı erişim denetimi ve tam OpenAPI dokümantasyonu içeren, üretime hazır bir RESTful API.

---

## ✨ Özellikler

- 🔐 **JWT Kimlik Doğrulama** — Passport.js ile güvenli kayıt ve giriş
- 📝 **Tam Görev CRUD** — Görev oluşturma, listeleme, güncelleme ve silme
- 🛡️ **Sahiplik Denetimi** — Kullanıcılar yalnızca kendi görevlerine erişebilir
- ✅ **İstek Doğrulama** — `class-validator` ile otomatik DTO doğrulaması
- 📚 **Swagger Dokümantasyonu** — `/api/docs` adresinde etkileşimli API dökümantasyonu
- 🏗️ **Modüler Mimari** — Auth, Kullanıcılar ve Görevler modülleri arasında temiz sorumluluk ayrımı

---

## 🛠️ Teknoloji Yığını

| Teknoloji | Kullanım Amacı |
|---|---|
| [NestJS](https://nestjs.com/) | Modüler Node.js framework'ü |
| [TypeScript](https://www.typescriptlang.org/) | Tip güvenliği ve modern JS |
| [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) | Veritabanı ve ODM |
| [Passport.js](http://www.passportjs.org/) + JWT | Kimlik doğrulama stratejisi |
| [class-validator](https://github.com/typestack/class-validator) | DTO doğrulaması |
| [@nestjs/swagger](https://docs.nestjs.com/openapi/introduction) | OpenAPI dokümantasyonu |
| [bcryptjs](https://www.npmjs.com/package/bcryptjs) | Şifre hashleme |

---

## 📁 Proje Yapısı

```
src/
├── auth/
│   ├── dto/
│   │   └── auth.dto.ts                  # KayitDto, GirisDto
│   ├── guards/
│   │   └── jwt-auth.guard.ts            # JwtAuthGuard (route koruyucu)
│   ├── strategies/
│   │   └── jwt.strategy.ts              # Passport JWT stratejisi
│   ├── auth.controller.ts               # POST /auth/kayit, /auth/giris
│   ├── auth.service.ts                  # Kimlik doğrulama iş mantığı
│   └── auth.module.ts
├── users/
│   ├── dto/
│   │   └── create-user.dto.ts
│   ├── schemas/
│   │   └── user.schema.ts               # Mongoose Kullanıcı şeması
│   ├── users.service.ts
│   └── users.module.ts
├── tasks/
│   ├── dto/
│   │   └── task.dto.ts                  # GorevOlusturDto, GorevGuncelleDto
│   ├── schemas/
│   │   └── task.schema.ts               # Mongoose Görev şeması + enum'lar
│   ├── tasks.controller.ts              # CRUD endpoint'leri
│   ├── tasks.service.ts                 # Görev iş mantığı + sahiplik denetimi
│   └── tasks.module.ts
├── common/
│   └── decorators/
│       └── get-current-user.decorator.ts  # @MevcutKullanici() özel dekoratör
├── app.module.ts                        # Kök modül
└── main.ts                              # Giriş noktası + Swagger kurulumu
```

---

## 🚀 Başlarken

### Gereksinimler

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) v9+
- Yerel olarak çalışan [MongoDB](https://www.mongodb.com/) **veya** bir [MongoDB Atlas](https://www.mongodb.com/atlas) bağlantı dizesi

### 1. Depoyu Klonlayın

```bash
git clone https://github.com/KULLANICI_ADINIZ/gorev-yonetimi-api.git
cd gorev-yonetimi-api
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Ortam Değişkenlerini Yapılandırın

Örnek ortam dosyasını kopyalayın ve değerleri doldurun:

```bash
cp .env.example .env
```

`.env` dosyasını açın ve şu değişkenleri ayarlayın:

```env
# Sunucu
PORT=3000
NODE_ENV=development

# MongoDB — bağlantı dizenizle değiştirin
MONGODB_URI=mongodb://localhost:27017/gorev-yonetimi

# JWT — üretimde uzun ve rastgele bir anahtar kullanın!
JWT_SECRET=cok_guclu_ve_gizli_anahtariniz
JWT_EXPIRES_IN=7d
```

> 💡 **Güvenli JWT anahtarı üretmek için:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 4. Geliştirme Sunucusunu Başlatın

```bash
npm run start:dev
```

API şu adreste kullanılabilir olacak: **`http://localhost:3000/api`**

---

## 📚 API Dokümantasyonu (Swagger)

Sunucu çalışırken şu adresi ziyaret edin:

```
http://localhost:3000/api/docs
```

Etkileşimli Swagger arayüzü ile:
- Tüm endpoint'leri istek/yanıt şemalarıyla keşfedebilirsiniz
- **"Authorize"** 🔒 düğmesiyle JWT tokenınızla kimlik doğrulaması yapabilirsiniz
- Test isteklerini doğrudan tarayıcıdan gönderebilirsiniz

---

## 🔌 API Endpoint'leri

### Kimlik Doğrulama (Herkese Açık)

| Metod | Endpoint | Açıklama |
|--------|----------|-------------|
| `POST` | `/api/auth/kayit` | Yeni hesap oluştur |
| `POST` | `/api/auth/giris` | Giriş yap ve JWT token al |

### Görevler (🔒 JWT Gerektirir)

| Metod | Endpoint | Açıklama |
|--------|----------|-------------|
| `POST` | `/api/gorevler` | Yeni görev oluştur |
| `GET` | `/api/gorevler` | Tüm görevleri getir (yalnızca mevcut kullanıcı) |
| `GET` | `/api/gorevler/:id` | ID'ye göre tek bir görevi getir |
| `PUT` | `/api/gorevler/:id` | Görevi güncelle (kısmi güncellemeler desteklenir) |
| `DELETE` | `/api/gorevler/:id` | Görevi sil |

### cURL ile Hızlı Başlangıç

**Kayıt Ol:**
```bash
curl -X POST http://localhost:3000/api/auth/kayit \
  -H "Content-Type: application/json" \
  -d '{"email":"kullanici@ornek.com","ad":"Ahmet Yılmaz","sifre":"Sifre@123"}'
```

**Giriş Yap:**
```bash
curl -X POST http://localhost:3000/api/auth/giris \
  -H "Content-Type: application/json" \
  -d '{"email":"kullanici@ornek.com","sifre":"Sifre@123"}'
```

**Görev Oluştur (giriş yanıtındaki token'ı kullanın):**
```bash
curl -X POST http://localhost:3000/api/gorevler \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer JWT_TOKENINIZ" \
  -d '{"baslik":"İlk görevim","oncelik":"YUKSEK"}'
```

---

## 🛡️ Güvenlik Tasarımı

- **Şifreler** saklanmadan önce `bcryptjs` ile hashlenir (10 tuzlama turu)
- **JWT token'lar** bir gizli anahtarla imzalanır ve yapılandırılan süre sonra sona erer
- **Sahiplik denetimi** veritabanı sorgu düzeyinde gerçekleşir — her görev sorgusu hem `gorevId` hem de `kullaniciId` ile filtrelenir; bu sayede kullanıcılar görev ID'sini bilseler bile birbirinin verilerine erişemez
- **İstek doğrulama** tanımsız özellikleri otomatik olarak siler ve geçersiz girdileri reddeder

---

## 🧪 Testleri Çalıştırma

```bash
# Birim testleri
npm run test

# İzleme modu
npm run test:watch

# Kapsam raporu
npm run test:cov
```

---

## 📦 Diğer Komutlar

```bash
npm run build        # TypeScript'i dist/ klasörüne derle
npm run start:prod   # Derlenmiş üretim yapısını çalıştır
npm run lint         # ESLint ile otomatik düzeltme
npm run format       # Prettier ile biçimlendirme
```

---

## 📄 Lisans

MIT
