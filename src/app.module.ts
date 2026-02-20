import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ParkingLotsModule } from './modules/parking/parking-lots/parking-lots.module';
import { FavoritesModule } from './modules/parking/parking-favorites/favorites.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { VehiclesModule } from './modules/vehiculo/vehicles.module';
import { AuditLogModule } from './modules/audit/audit-log.module';
import { QrModule } from './modules/qr/qr.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ParkingLotsModule,
    FavoritesModule,
    ReservationsModule,
    VehiclesModule,
    AuditLogModule,
    QrModule,


  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
