import type { CreateItemPayload } from '@/types/item';
import type { FieldErrors, MediaFile } from '@/types/item';

export function validateForm(payload: CreateItemPayload, media: MediaFile[]): FieldErrors {
  const errors: FieldErrors = {};

  if (!payload.nombre.trim()) errors.nombre = 'El nombre es obligatorio';
  else if (payload.nombre.length > 120) errors.nombre = 'Máximo 120 caracteres';

  if (!payload.descripcion.trim()) errors.descripcion = 'La descripción es obligatoria';
  else if (payload.descripcion.length > 1000) errors.descripcion = 'Máximo 1000 caracteres';

  if (payload.precio == null || payload.precio < 0 || isNaN(payload.precio)) errors.precio = 'El precio debe ser mayor o igual a 0';

  if (payload.tipoOferta === 'percentage') {
    if (payload.descuento < 0 || payload.descuento > 100)
      errors.descuento = 'El porcentaje debe estar entre 0 y 100';
  } else {
    if (payload.descuento <= 0) errors.descuento = 'El descuento debe ser mayor a 0';
  }

  if (!payload.fechaInicio) errors.fechaInicio = 'La fecha de inicio es obligatoria';
  if (!payload.fechaFin) errors.fechaFin = 'La fecha de fin es obligatoria';

  if (payload.fechaInicio && payload.fechaFin) {
    if (new Date(payload.fechaInicio) > new Date(payload.fechaFin))
      errors.fechaFin = 'La fecha de fin debe ser igual o posterior a la de inicio';
  }

  if (media.length === 0) errors.multimedia = 'Debe adjuntar al menos un archivo multimedia';

  return errors;
}
