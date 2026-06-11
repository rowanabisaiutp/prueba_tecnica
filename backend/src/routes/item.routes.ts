import { Router } from 'express';

import { createItemHandler, getAllItems, healthCheck } from '../controllers/item.controller.js';
import { uploadMedia } from '../middlewares/upload.middleware.js';

export const itemRouter = Router();

itemRouter.get('/health', healthCheck);
itemRouter.get('/items', getAllItems);
itemRouter.post('/items', uploadMedia, createItemHandler);