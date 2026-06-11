import { env } from './config/env.js';
import { bootstrapApp } from './app.js';
import { pool } from './db/pool.js';

async function main() {
  const app = await bootstrapApp();

  app.listen(env.port, () => {
    console.log(`API escuchando en http://localhost:${env.port}`);
  });
}

main().catch(async (error: Error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});