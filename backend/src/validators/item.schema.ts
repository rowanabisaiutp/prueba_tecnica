import { z } from 'zod';

const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
  'video/mp4', 'video/quicktime', 'video/3gpp', 'video/x-msvideo',
];

const fileSchema = z.object({
  fieldname: z.string().min(1),
  originalname: z.string().min(1),
  mimetype: z.enum(ALLOWED_MIME_TYPES as [string, ...string[]], {
    message: `Tipo de archivo no permitido. Formatos aceptados: JPG, PNG, WEBP, MP4, MOV`,
  }),
  filename: z.string().min(1),
  path: z.string().min(1),
  size: z.number().int().positive().max(100 * 1024 * 1024, 'El archivo supera el límite de 100 MB'),
});

export const createItemSchema = z
  .object({
    nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(120),
    descripcion: z.string().trim().min(1, 'La descripción es obligatoria').max(1000),
    precio: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0'),
    tipoOferta: z.enum(['money', 'percentage'], {
      required_error: 'El tipo de oferta es obligatorio',
    }),
    descuento: z.coerce.number(),
    fechaInicio: z.string().trim().min(1, 'La fecha de inicio es obligatoria'),
    fechaFin: z.string().trim().min(1, 'La fecha de fin es obligatoria'),
    multimedia: z.array(fileSchema).min(1, 'Debe adjuntar al menos un archivo multimedia').max(10, 'Máximo 10 archivos'),
  })
  .superRefine((data, ctx) => {
    const fechaInicio = new Date(data.fechaInicio);
    const fechaFin = new Date(data.fechaFin);

    if (Number.isNaN(fechaInicio.getTime())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['fechaInicio'], message: 'La fecha de inicio no es válida' });
    }

    if (Number.isNaN(fechaFin.getTime())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['fechaFin'], message: 'La fecha de fin no es válida' });
    }

    if (!Number.isNaN(fechaInicio.getTime()) && !Number.isNaN(fechaFin.getTime()) && fechaInicio > fechaFin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fechaFin'],
        message: 'La fecha de fin debe ser igual o posterior a la fecha de inicio',
      });
    }

    if (data.tipoOferta === 'percentage') {
      if (data.descuento < 0 || data.descuento > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['descuento'],
          message: 'El porcentaje debe estar entre 0 y 100',
        });
      }
    }

    if (data.tipoOferta === 'money' && data.descuento <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['descuento'],
        message: 'El descuento en dinero debe ser mayor a 0',
      });
    }
  });

export type CreateItemInput = z.infer<typeof createItemSchema>;