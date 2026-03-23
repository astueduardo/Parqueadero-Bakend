import { registerAs } from '@nestjs/config';

export default registerAs('database-local', () => {
    const password = process.env.DB_PASSWORD;
    if (!password) {
        throw new Error('DB_PASSWORD no está definida en las variables de entorno');
    }

    return {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password,
        database: process.env.DB_DATABASE || 'Movil__app',
        synchronize: process.env.DB_SYNCHRONIZE === 'true',
    };
});