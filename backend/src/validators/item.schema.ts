import { z } from 'zod';

const fileSchema = z.object({
  fieldname: z.string().min(1),
  originalname: z.string().min(1),
  mimetype: z.string().regex(/^(image|video)\//, 'La multimedia debe ser imagen o video'),
  filename: z.string().min(1),
  path: z.string().min(1),
  size: z.number().int().positive(),
});

export const createItemSchema = z
  .object({
    nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(120),
    descripcion: z.string().trim().min(1, 'La descripción es obligatoria').max(1000),
    precio: z.coerce.number().positive('El precio debe ser mayor a 0'),
    tipoOferta: z.enum(['money', 'percentage'], {
      required_error: 'El tipo de oferta es obligatorio',
    }),
    descuento: z.coerce.number(),
    fechaInicio: z.string().trim().min(1, 'La fecha de inicio es obligatoria'),
    fechaFin: z.string().trim().min(1, 'La fecha de fin es obligatoria'),
    multimedia: z.array(fileSchema).min(1, 'Debe adjuntar al menos un archivo multimedia'),
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