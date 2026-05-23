import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Gorev, GorevDocument } from './schemas/task.schema';
import { GorevOlusturDto, GorevGuncelleDto } from './dto/task.dto';

/**
 * TasksService — Görev yönetimi için tüm iş mantığını içerir.
 *
 * GÜVENLİK PRENSİBİ — Sahiplik Denetimi:
 * Bir görevi okuyan, değiştiren veya silen her metod, isteği yapan kullanıcının
 * o göreve sahip olduğunu DOĞRULAMALIDIR. Bu, sorguları hem görevin _id'si hem de
 * kullanıcının _id'si (sahip olarak) ile filtreleyerek yapılır.
 *
 * Bu "derinlemesine savunma" yaklaşımı, bir hata guard'ı atlasa bile
 * servis katmanının sahipliği hâlâ zorunlu kıldığı anlamına gelir.
 */
@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Gorev.name) private readonly gorevModeli: Model<GorevDocument>,
  ) {}

  /**
   * Yeni bir görev oluşturur ve kimliği doğrulanmış kullanıcıyı otomatik olarak sahip atar.
   * Sahip, JWT token'dan sunucu tarafında belirlenir — istemciler sahipliği taklit edemez.
   */
  async olustur(dto: GorevOlusturDto, kullaniciId: string): Promise<GorevDocument> {
    const yeniGorev = new this.gorevModeli({
      ...dto,
      sahip: new Types.ObjectId(kullaniciId), // Sahiplik kimliği doğrulanmış kullanıcıdan alınır
    });
    return yeniGorev.save();
  }

  /**
   * Kimliği doğrulanmış kullanıcıya ait TÜM görevleri getirir.
   * 'sahip' filtresi, kullanıcıların birbirinin görevlerini görmesini kesinlikle engeller.
   */
  async tumunuGetir(kullaniciId: string): Promise<GorevDocument[]> {
    return this.gorevModeli
      .find({ sahip: new Types.ObjectId(kullaniciId) })
      .sort({ createdAt: -1 }) // En yeni görevleri önce göster
      .exec();
  }

  /**
   * ID'ye göre tek bir görevi getirir.
   *
   * Sahiplik denetim stratejisi:
   * Hem `_id` hem de `sahip` ile sorgu yapılır. Görev mevcutsa ama başka bir
   * kullanıcıya aitse sorgu null döner (bulunamadı gibi davranır).
   * Bu, bilgi sızıntısını önler — saldırganlar bir görevin var olup olmadığını
   * ya da kendilerine ait olmadığını anlayamaz.
   */
  async biriniGetir(gorevId: string, kullaniciId: string): Promise<GorevDocument> {
    this.objectIdDogrula(gorevId);

    const gorev = await this.gorevModeli
      .findOne({
        _id: new Types.ObjectId(gorevId),
        sahip: new Types.ObjectId(kullaniciId), // Sahiplik sorgu düzeyinde zorunlu
      })
      .exec();

    if (!gorev) {
      throw new NotFoundException(`"${gorevId}" ID'li görev bulunamadı.`);
    }

    return gorev;
  }

  /**
   * Bir görevin alanlarını günceller. Yalnızca sahip kendi görevini güncelleyebilir.
   *
   * Atomik "bul + güncelle" işlemi için findOneAndUpdate kullanılır.
   * Bu, eş zamanlı ortamlarda ayrı find() ve save() çağrılarından daha güvenlidir.
   * - new: true          → Orijinal değil, güncellenmiş belgeyi döner.
   * - runValidators: true → Güncelleme sırasında şema doğrulamasını uygular.
   */
  async guncelle(
    gorevId: string,
    dto: GorevGuncelleDto,
    kullaniciId: string,
  ): Promise<GorevDocument> {
    this.objectIdDogrula(gorevId);

    const guncellenenGorev = await this.gorevModeli
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(gorevId),
          sahip: new Types.ObjectId(kullaniciId), // Sahiplik zorunlu
        },
        { $set: dto },
        { new: true, runValidators: true },
      )
      .exec();

    if (!guncellenenGorev) {
      throw new NotFoundException(`"${gorevId}" ID'li görev bulunamadı.`);
    }

    return guncellenenGorev;
  }

  /**
   * Bir görevi kalıcı olarak siler. Yalnızca sahip kendi görevini silebilir.
   *
   * Sahipliği tek bir sorguda kontrol edip silen atomik bir işlem için
   * findOneAndDelete kullanılır.
   */
  async sil(gorevId: string, kullaniciId: string): Promise<{ mesaj: string }> {
    this.objectIdDogrula(gorevId);

    const silinenGorev = await this.gorevModeli
      .findOneAndDelete({
        _id: new Types.ObjectId(gorevId),
        sahip: new Types.ObjectId(kullaniciId), // Sahiplik zorunlu
      })
      .exec();

    if (!silinenGorev) {
      throw new NotFoundException(`"${gorevId}" ID'li görev bulunamadı.`);
    }

    return { mesaj: `"${silinenGorev.baslik}" görevi başarıyla silindi.` };
  }

  /**
   * MongoDB ObjectId formatını doğrulayan özel yardımcı metod.
   * Geçersiz ID formatı sağlandığında Mongoose'un kafa karıştırıcı CastError
   * fırlatmasını engeller; kullanıcıya bunun yerine açık bir 404 döner.
   */
  private objectIdDogrula(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`"${id}" ID'li görev bulunamadı.`);
    }
  }
}
