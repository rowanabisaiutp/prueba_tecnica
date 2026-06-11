import cors from 'cors';
import express from 'express';

import { env } from './config/env.js';
import { ensureDatabaseSchemaWithRetry } from './db/migrate.js';
import { itemRouter } from './routes/item.routes.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigin,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static('uploads'));
  app.use('/api', itemRouter);

  app.use((req, res) => {
    res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
  });

  app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).json({ message: error.message || 'Error interno del servidor' });
  });

  return app;
}

export async function bootstrapApp() {
  await ensureDatabaseSchemaWithRetry();

  return createApp();
}