import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { GorevOlusturDto, GorevGuncelleDto } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MevcutKullanici } from '../common/decorators/get-current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';

/**
 * TasksController — Görevler için tüm CRUD endpoint'lerini yönetir.
 *
 * Bu controller'daki TÜM route'lar JwtAuthGuard ile korunur.
 * Guard'ı controller düzeyinde uygulamak (tekil route'lar yerine),
 * hiçbir route'un yanlışlıkla korumasız bırakılmamasını sağlar.
 *
 * @ApiBearerAuth('JWT-auth') dekoratörü, Swagger'a bu endpoint'ler için
 * "Authorize" düğmesini göstermesini söyler (isim main.ts ile eşleşmeli).
 */
@ApiTags('Görevler')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard) // ← Bu controller'daki TÜM route'lara uygulanır
@Controller('gorevler')
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  // ─── OLUŞTUR ──────────────────────────────────────────────────────────────

  /**
   * POST /api/gorevler
   * Yeni bir görev oluşturur. Sahip, JWT token'dan otomatik olarak atanır.
   */
  @Post()
  @ApiOperation({
    summary: 'Yeni görev oluştur',
    description: 'Kimliği doğrulanmış kullanıcıya ait yeni bir görev oluşturur.',
  })
  @ApiResponse({ status: 201, description: 'Görev başarıyla oluşturuldu.' })
  @ApiResponse({ status: 400, description: 'Doğrulama hatası.' })
  @ApiResponse({ status: 401, description: 'Yetkisiz — geçersiz veya eksik token.' })
  async olustur(
    @Body() dto: GorevOlusturDto,
    @MevcutKullanici() kullanici: UserDocument, // Özel dekoratör, kullanıcıyı req.user'dan çıkarır
  ) {
    return this.taskService.olustur(dto, kullanici._id.toString());
  }

  // ─── TÜMÜNÜ GETİR ─────────────────────────────────────────────────────────

  /**
   * GET /api/gorevler
   * Kimliği doğrulanmış kullanıcıya ait tüm görevleri döner.
   */
  @Get()
  @ApiOperation({
    summary: 'Mevcut kullanıcının tüm görevlerini getir',
    description: 'Kimliği doğrulanmış kullanıcıya ait görevlerin listesini en yeniden eskiye döner.',
  })
  @ApiResponse({ status: 200, description: 'Görev listesi döndürüldü.' })
  @ApiResponse({ status: 401, description: 'Yetkisiz.' })
  async tumunuGetir(@MevcutKullanici() kullanici: UserDocument) {
    return this.taskService.tumunuGetir(kullanici._id.toString());
  }

  // ─── BİRİNİ GETİR ─────────────────────────────────────────────────────────

  /**
   * GET /api/gorevler/:id
   * ID'ye göre tek bir görevi döner.
   * Bulunamazsa veya kullanıcıya ait değilse 404 döner.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'ID\'ye göre tek bir görevi getir',
    description: 'Görev mevcutsa ve kimliği doğrulanmış kullanıcıya aitse döner.',
  })
  @ApiParam({ name: 'id', description: 'Görevin MongoDB ObjectId değeri', example: '64a9f8b2c3d4e5f6a7b8c9d0' })
  @ApiResponse({ status: 200, description: 'Görev bulundu ve döndürüldü.' })
  @ApiResponse({ status: 401, description: 'Yetkisiz.' })
  @ApiResponse({ status: 404, description: 'Görev bulunamadı (veya bu kullanıcıya ait değil).' })
  async biriniGetir(
    @Param('id') id: string,
    @MevcutKullanici() kullanici: UserDocument,
  ) {
    return this.taskService.biriniGetir(id, kullanici._id.toString());
  }

  // ─── GÜNCELLE ─────────────────────────────────────────────────────────────

  /**
   * PUT /api/gorevler/:id
   * Bir görevi günceller. Tüm alanlar isteğe bağlıdır — yalnızca değiştirmek istediklerinizi gönderin.
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Görevi güncelle',
    description:
      'Bir görevin bir veya daha fazla alanını günceller. İstek gövdesindeki tüm alanlar isteğe bağlıdır. ' +
      'Yalnızca görev sahibi bu işlemi yapabilir.',
  })
  @ApiParam({ name: 'id', description: 'Görevin MongoDB ObjectId değeri', example: '64a9f8b2c3d4e5f6a7b8c9d0' })
  @ApiResponse({ status: 200, description: 'Görev başarıyla güncellendi.' })
  @ApiResponse({ status: 400, description: 'Doğrulama hatası.' })
  @ApiResponse({ status: 401, description: 'Yetkisiz.' })
  @ApiResponse({ status: 404, description: 'Görev bulunamadı (veya bu kullanıcıya ait değil).' })
  async guncelle(
    @Param('id') id: string,
    @Body() dto: GorevGuncelleDto,
    @MevcutKullanici() kullanici: UserDocument,
  ) {
    return this.taskService.guncelle(id, dto, kullanici._id.toString());
  }

  // ─── SİL ──────────────────────────────────────────────────────────────────

  /**
   * DELETE /api/gorevler/:id
   * Bir görevi kalıcı olarak siler. Yalnızca sahip kendi görevini silebilir.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Görevi sil',
    description: 'Bir görevi kalıcı olarak siler. Yalnızca görev sahibi bu işlemi yapabilir.',
  })
  @ApiParam({ name: 'id', description: 'Görevin MongoDB ObjectId değeri', example: '64a9f8b2c3d4e5f6a7b8c9d0' })
  @ApiResponse({ status: 200, description: 'Görev başarıyla silindi.' })
  @ApiResponse({ status: 401, description: 'Yetkisiz.' })
  @ApiResponse({ status: 404, description: 'Görev bulunamadı (veya bu kullanıcıya ait değil).' })
  async sil(
    @Param('id') id: string,
    @MevcutKullanici() kullanici: UserDocument,
  ) {
    return this.taskService.sil(id, kullanici._id.toString());
  }
}
