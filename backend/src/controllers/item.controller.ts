import type { Request, Response } from 'express';

import { createItem, getItems } from '../services/item.service.js';
import { createItemSchema } from '../validators/item.schema.js';

function normalizeFiles(files: Request['files']) {
  if (!files) {
    return [] as Express.Multer.File[];
  }

  if (Array.isArray(files)) {
    return files;
  }

  return Object.values(files).flat();
}

export function healthCheck(_req: Request, res: Response) {
  res.json({ ok: true, service: 'backend', timestamp: new Date().toISOString() });
}

export function getAllItems(_req: Request, res: Response) {
  Promise.resolve(getItems())
    .then((items) => {
      res.json({ items });
    })
    .catch((error: Error) => {
      res.status(500).json({ message: error.message || 'Error interno del servidor' });
    });
}

export function createItemHandler(req: Request, res: Response) {
  const multimediaFiles = normalizeFiles(req.files);

  const parseResult = createItemSchema.safeParse({
    ...req.body,
    multimedia: multimediaFiles,
  });

  if (!parseResult.success) {
    return res.status(400).json({
      message: 'Hay errores de validación',
      errors: parseResult.error.flatten(),
    });
  }

  const { multimedia: _multimedia, ...itemData } = parseResult.data;
  return createItem(itemData, multimediaFiles)
    .then((item) => {
      return res.status(201).json({
        message: 'Item creado correctamente',
        item,
      });
    })
    .catch((error: Error) => {
      return res.status(500).json({ message: error.message || 'Error interno del servidor' });
    });
}