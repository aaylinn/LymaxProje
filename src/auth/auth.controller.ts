import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { KayitDto, GirisDto } from './dto/auth.dto';

/**
 * AuthController — Kimlik doğrulama endpoint'leri için HTTP isteklerini yönetir.
 *
 * Bu route'lar HERKESE AÇIKTIR (JwtAuthGuard yok), çünkü kullanıcıların
 * token almadan önce bu adrese erişmesi gerekir.
 *
 * Route'lar:
 *   POST /api/auth/kayit  — Yeni hesap oluştur
 *   POST /api/auth/giris  — Mevcut hesaba giriş yap
 */
@ApiTags('Kimlik Doğrulama')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/kayit
   * Yeni bir kullanıcı hesabı oluşturur ve JWT token döner.
   */
  @Post('kayit')
  @ApiOperation({
    summary: 'Yeni kullanıcı kaydı',
    description: 'Yeni bir kullanıcı hesabı oluşturur. Başarı durumunda JWT token ve kullanıcı bilgisi döner.',
  })
  @ApiBody({ type: KayitDto })
  @ApiResponse({
    status: 201,
    description: 'Kullanıcı başarıyla kaydedildi.',
    schema: {
      example: {
        erisimToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        kullanici: {
          id: '64a9f8b2c3d4e5f6a7b8c9d0',
          email: 'ahmet.yilmaz@ornek.com',
          ad: 'Ahmet Yılmaz',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Doğrulama hatası (geçersiz giriş).' })
  @ApiResponse({ status: 409, description: 'Bu e-posta adresi zaten kayıtlı.' })
  async kayitOl(@Body() kayitDto: KayitDto) {
    return this.authService.kayitOl(kayitDto);
  }

  /**
   * POST /api/auth/giris
   * @HttpCode(200) — Varsayılan 201 kodunu geçersiz kılar;
   * giriş işlemi bir "oluşturma" eylemi değildir.
   */
  @Post('giris')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mevcut kimlik bilgileriyle giriş yap',
    description: 'E-posta ve şifreyi doğrular. Başarı durumunda JWT token ve kullanıcı bilgisi döner.',
  })
  @ApiBody({ type: GirisDto })
  @ApiResponse({
    status: 200,
    description: 'Giriş başarılı.',
    schema: {
      example: {
        erisimToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        kullanici: {
          id: '64a9f8b2c3d4e5f6a7b8c9d0',
          email: 'ahmet.yilmaz@ornek.com',
          ad: 'Ahmet Yılmaz',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Doğrulama hatası (geçersiz giriş).' })
  @ApiResponse({ status: 401, description: 'Geçersiz e-posta adresi veya şifre.' })
  async girisYap(@Body() girisDto: GirisDto) {
    return this.authService.girisYap(girisDto);
  }
}
