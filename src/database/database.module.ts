// database/database.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = process.env.NODE_ENV || 'development';
        const isProduction = nodeEnv === 'production';

        if (isProduction && process.env.DATABASE_URL) {
          // Usar configuración cloud
          const cloudConfig = configService.get('database-cloud');
          return {
            type: 'postgres',
            url: cloudConfig.url,
            synchronize: cloudConfig.synchronize,
            autoLoadEntities: true,
            ssl: {
              rejectUnauthorized: false,
            },
          };
        }

        // Usar configuración local
        const localConfig = configService.get('database-local');
        return {
          type: 'postgres',
          host: localConfig.host,
          port: localConfig.port,
          username: localConfig.username,
          password: localConfig.password,
          database: localConfig.database,
          synchronize: localConfig.synchronize,
          autoLoadEntities: true,
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule { }