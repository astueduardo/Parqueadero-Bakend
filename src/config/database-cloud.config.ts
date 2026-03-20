import { registerAs } from '@nestjs/config';

export default registerAs('database-cloud', () => ({
    url: process.env.DATABASE_URL,
    synchronize: false,
}));