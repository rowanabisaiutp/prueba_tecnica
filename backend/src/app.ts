import { MulterError } from 'multer';

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
    if (error instanceof MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'El archivo supera el límite de 100 MB' });
      }
      if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(413).json({ message: `Máximo ${10} archivos permitidos` });
      }
      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ message: 'Campo de archivo inesperado' });
      }
      return res.status(400).json({ message: error.message });
    }

    if (error.message?.includes('Tipo de archivo no permitido')) {
      return res.status(415).json({ message: error.message });
    }

    res.status(500).json({ message: error.message || 'Error interno del servidor' });
  });

  return app;
}

export async function bootstrapApp() {
  await ensureDatabaseSchemaWithRetry();

  return createApp();
}