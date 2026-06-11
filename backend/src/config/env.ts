import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  databaseUrl:
    process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/miproyecto',
};