import { pool } from './pool.js';

export async function ensureDatabaseSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      precio NUMERIC(12,2) NOT NULL,
      tipo_oferta TEXT NOT NULL CHECK (tipo_oferta IN ('money', 'percentage')),
      descuento NUMERIC(12,2) NOT NULL,
      fecha_inicio TIMESTAMPTZ NOT NULL,
      fecha_fin TIMESTAMPTZ NOT NULL,
      multimedia JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function sleep(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export async function ensureDatabaseSchemaWithRetry(maxAttempts = 10) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await ensureDatabaseSchema();
      return;
    } catch (error) {
      lastError = error;

      if (attempt < maxAttempts) {
        await sleep(2000);
      }
    }
  }

  throw lastError;
}