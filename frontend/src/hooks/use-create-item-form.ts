import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { createItem } from '@/services/api';
import type { CreateItemPayload, FieldErrors, MediaFile, TipoOferta } from '@/types/item';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, MAX_FILE_COUNT, ALLOWED_MIME_TYPES } from '@/types/item';
import { validateForm } from '@/utils/validate-item';
import { generateVideoThumbnail } from '@/utils/media';

function guessMimeType(uri: string, fallbackIsVideo: boolean): string {
  const ext = uri.split('.').pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    webp: 'image/webp', heic: 'image/heic', heif: 'image/heif',
    gif: 'image/gif', bmp: 'image/bmp',
    mp4: 'video/mp4', mov: 'video/quicktime',
    avi: 'video/x-msvideo', '3gp': 'video/3gpp',
    mkv: 'video/x-matroska', webm: 'video/webm',
  };
  if (ext && mimeMap[ext]) return mimeMap[ext];
  return fallbackIsVideo ? 'video/mp4' : 'image/jpeg';
}

export function useCreateItemForm() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [tipoOferta, setTipoOferta] = useState<TipoOferta>('money');
  const [descuento, setDescuento] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());
  const [showFechaInicio, setShowFechaInicio] = useState(false);
  const [showFechaFin, setShowFechaFin] = useState(false);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showTipoMenu, setShowTipoMenu] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const clearFieldError = useCallback((field: keyof FieldErrors) => {
    setErrors((p) => ({ ...p, [field]: undefined }));
  }, []);

  const pickMedia = useCallback(async (fromCamera: boolean) => {
    try {
      if (fromCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso requerido', 'Se necesita acceso a la cámara');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso requerido', 'Se necesita acceso a la galería');
          return;
        }
      }

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images', 'videos'],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            quality: 0.8,
            allowsMultipleSelection: true,
            orderedSelection: true,
          });

      if (result.canceled) return;

      const availableSlots = MAX_FILE_COUNT - media.length;
      if (availableSlots <= 0) {
        Alert.alert('Límite alcanzado', `Máximo ${MAX_FILE_COUNT} archivos`);
        return;
      }

      const assets = result.assets.slice(0, availableSlots);
      const rejectedCount = result.assets.length - assets.length;
      if (rejectedCount > 0) {
        Alert.alert('Límite de archivos', `Solo se agregaron ${assets.length} de ${result.assets.length} (máximo ${MAX_FILE_COUNT})`);
      }

      const oversized: string[] = [];
      const invalidType: string[] = [];
      const validAssets = assets.filter((asset) => {
        const isVideo = asset.type === 'video';
        const mimeType = guessMimeType(asset.uri, isVideo);

        if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_BYTES) {
          const sizeMB = (asset.fileSize / 1024 / 1024).toFixed(1);
          oversized.push(`${asset.fileName || 'archivo'} (${sizeMB} MB)`);
          return false;
        }

        if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
          invalidType.push(asset.fileName || mimeType);
          return false;
        }

        return true;
      });

      if (oversized.length > 0) {
        Alert.alert('Archivo demasiado grande', `Los siguientes archivos superan el límite de ${MAX_FILE_SIZE_MB} MB:\n\n${oversized.join('\n')}`);
      }
      if (invalidType.length > 0) {
        Alert.alert('Formato no soportado', `Formatos permitidos: JPG, PNG, WEBP, MP4, MOV\n\nNo aceptados:\n${invalidType.join(', ')}`);
      }

      if (validAssets.length === 0) return;

      const newMedia: MediaFile[] = validAssets.map((asset) => {
        const isVideo = asset.type === 'video';
        const mimeType = guessMimeType(asset.uri, isVideo);
        const ext = asset.uri.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
        return {
          uri: asset.uri,
          name: asset.fileName || (isVideo ? `video_${Date.now()}.${ext}` : `photo_${Date.now()}.${ext}`),
          type: mimeType,
          size: asset.fileSize || 0,
        };
      });

      const withThumbnails = await Promise.all(
        newMedia.map(async (m) => {
          if (!m.type.startsWith('video')) return m;
          try {
            const thumb = await generateVideoThumbnail(m.uri);
            return thumb ? { ...m, thumbnail: thumb } : m;
          } catch {
            return m;
          }
        })
      );

      setMedia((prev) => [...prev, ...withThumbnails]);
      setErrors((prev) => ({ ...prev, multimedia: undefined }));
    } catch {
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  }, [media.length]);

  const removeMedia = useCallback((index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
    const payload: CreateItemPayload = {
      nombre,
      descripcion,
      precio: parseFloat(precio) || 0,
      tipoOferta,
      descuento: parseFloat(descuento) || 0,
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaFin.toISOString(),
    };

    const validationErrors = validateForm(payload, media);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      Alert.alert('Errores de validación', 'Corrige los campos marcados en rojo');
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);
    try {
      await createItem(payload, media, (progress) => {
        setUploadProgress(Math.round(progress * 100));
      });
      resetForm();
      Alert.alert('Éxito', 'Item creado correctamente', [
        { text: 'OK', onPress: () => { router.navigate('/'); } },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Error al crear el item';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  }, [nombre, descripcion, precio, tipoOferta, descuento, fechaInicio, fechaFin, media, router]);

  const resetForm = useCallback(() => {
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setTipoOferta('money');
    setDescuento('');
    setFechaInicio(new Date());
    setFechaFin(new Date());
    setMedia([]);
    setErrors({});
    setUploadProgress(0);
  }, []);

  return {
    nombre, setNombre,
    descripcion, setDescripcion,
    precio, setPrecio,
    tipoOferta, setTipoOferta,
    descuento, setDescuento,
    fechaInicio, setFechaInicio,
    fechaFin, setFechaFin,
    showFechaInicio, setShowFechaInicio,
    showFechaFin, setShowFechaFin,
    showTipoMenu, setShowTipoMenu,
    errors, setErrors, clearFieldError,
    submitting, handleSubmit,
    uploadProgress,
    media, pickMedia, removeMedia,
  };
}
