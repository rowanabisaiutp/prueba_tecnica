import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { createItem } from '@/services/api';
import type { CreateItemPayload, FieldErrors, MediaFile, TipoOferta } from '@/types/item';
import { validateForm } from '@/utils/validate-item';
import { generateVideoThumbnail } from '@/utils/media';

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
          });

      if (result.canceled) return;

      const newMedia: MediaFile[] = result.assets.map((asset) => {
        const isVideo = asset.type === 'video';
        const ext = asset.uri.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
        return {
          uri: asset.uri,
          name: isVideo ? `video_${Date.now()}.${ext}` : `photo_${Date.now()}.${ext}`,
          type: isVideo ? `video/${ext}` : `image/${ext}`,
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
  }, []);

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
    try {
      await createItem(payload, media);
      resetForm();
      Alert.alert('Éxito', 'Item creado correctamente', [
        { text: 'OK', onPress: () => { router.navigate('/'); } },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Error al crear el item';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
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
    media, pickMedia, removeMedia,
  };
}
