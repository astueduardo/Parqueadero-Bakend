import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {

        const databaseUrl = configService.get<string>('postgresql://movil_app_user:CBFLv8eY3Tk2TyzETYwemTSHxm2Gp7vE@dpg-d6bs9hl6ubrc73ef06u0-a.oregon-postgres.render.com/movil_app');

        if (databaseUrl) {
          // PRODUCCIÓN (Render)
          return {
            type: 'postgres',
            url: databaseUrl,
            autoLoadEntities: true,
            synchronize: true,
            ssl: {
              rejectUnauthorized: false,
            },
          };
        }

        return {
          type: 'postgres',
          host: configService.get('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get('database.username'),
          password: configService.get('database.password'),
          database: configService.get('database.database'),
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: configService.get<boolean>('database.synchronize'),
          logging: true,
        };
      },
      inject: [ConfigService],
    })
  ],
})
export class DatabaseModule { }
