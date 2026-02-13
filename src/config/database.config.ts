import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'PostgreSQL',
    password: process.env.DB_PASSWORD || '2101087019',
    database: process.env.DB_DATABASE || 'Movil__app',
    synchronize: (process.env.DB_SYNCHRONIZE === 'true') || false,
}));