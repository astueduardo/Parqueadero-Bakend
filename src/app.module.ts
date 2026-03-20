import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { FavoritesModule } from './modules/parking/parking-favorites/favorites.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { VehiclesModule } from './modules/vehiculo/vehicles.module';
import { AuditLogModule } from './modules/audit/audit-log.module';
import { QrModule } from './modules/qr/qr.module';
import { ParkingModule } from './modules/parking/parking.module';
import databaseCloudConfig from './config/database-cloud.config';
import databaseLocalConfig from './config/database-Local.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseLocalConfig, databaseCloudConfig],
    }),
    DatabaseModule,
    AuthModule,
    ParkingModule,
    UsersModule,
    ReservationsModule,
    FavoritesModule,
    VehiclesModule,
    AuditLogModule,
    QrModule,


  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
