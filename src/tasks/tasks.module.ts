import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Gorev, GorevSchema } from './schemas/task.schema';
import { AuthModule } from '../auth/auth.module';

/**
 * TasksModule — Göreve ait tüm mantığı kapsüller.
 *
 * Bağımlılıklar:
 * - MongooseModule: Gorev modelini TasksService'e enjekte edebilmek için kaydeder.
 * - AuthModule: PassportModule'ü dışa aktarır; JwtAuthGuard için gereklidir.
 *   AuthModule import edilmeden JwtStrategy kullanılamaz ve guard hata fırlatır.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Gorev.name, schema: GorevSchema }]),
    // AuthModule, PassportModule ve JwtModule'ü dışa aktarır.
    // Bu modüller, TasksController'da kullanılan JwtAuthGuard için gereklidir.
    AuthModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
