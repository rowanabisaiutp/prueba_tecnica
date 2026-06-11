import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { createItem } from '@/services/api';
import type { CreateItemPayload, TipoOferta } from '@/types/item';

type FieldErrors = Partial<Record<keyof CreateItemPayload | 'multimedia', string>>;

type MediaFile = {
  uri: string;
  name: string;
  type: string;
};

function validateForm(payload: CreateItemPayload, media: MediaFile[]): FieldErrors {
  const errors: FieldErrors = {};

  if (!payload.nombre.trim()) errors.nombre = 'El nombre es obligatorio';
  else if (payload.nombre.length > 120) errors.nombre = 'Máximo 120 caracteres';

  if (!payload.descripcion.trim()) errors.descripcion = 'La descripción es obligatoria';
  else if (payload.descripcion.length > 1000) errors.descripcion = 'Máximo 1000 caracteres';

  if (!payload.precio || payload.precio <= 0) errors.precio = 'El precio debe ser mayor a 0';

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

export default function CreateScreen() {
  const theme = useTheme();
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

  async function pickMedia(fromCamera: boolean) {
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

      setMedia((prev) => [...prev, ...newMedia]);
      if (errors.multimedia) setErrors((prev) => ({ ...prev, multimedia: undefined }));
    } catch {
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  }

  function removeMedia(index: number) {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
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
  }

  function resetForm() {
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setTipoOferta('money');
    setDescuento('');
    setFechaInicio(new Date());
    setFechaFin(new Date());
    setMedia([]);
    setErrors({});
  }

  function fieldBorder(hasError: boolean) {
    return {
      borderColor: hasError ? '#e74c3c' : theme.backgroundElement,
      backgroundColor: theme.background,
      color: theme.text,
    };
  }

  const descuentoLabel =
    tipoOferta === 'money' ? 'Descuento en dinero ($)' : 'Descuento en porcentaje (%)';
  const descuentoPlaceholder = tipoOferta === 'money' ? 'Ej: 500' : 'Ej: 15';
  const descuentoKeyboard = tipoOferta === 'percentage' ? 'numeric' : 'decimal-pad';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.form}>
              <View style={styles.header}>
                <View style={[styles.headerIcon, { backgroundColor: '#208AEF22' }]}>
                  <ThemedText style={styles.headerIconText}>+</ThemedText>
                </View>
                <View style={styles.headerText}>
                  <ThemedText type="subtitle" style={styles.heading}>Nuevo Item</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Completa todos los campos para crear un item
                  </ThemedText>
                </View>
              </View>

              {/* Sección: Información General */}
              <ThemedView type="backgroundElement" style={styles.section}>
                <ThemedText type="smallBold" style={styles.sectionTitle}>
                  Información General
                </ThemedText>

                <View style={styles.fieldGroup}>
                  <ThemedText type="small" themeColor="textSecondary">Nombre *</ThemedText>
                  <TextInput
                    style={[styles.input, fieldBorder(!!errors.nombre)]}
                    value={nombre}
                    onChangeText={(t) => {
                      setNombre(t);
                      if (errors.nombre) setErrors((p) => ({ ...p, nombre: undefined }));
                    }}
                    placeholder="Nombre del item"
                    placeholderTextColor={theme.textSecondary}
                    maxLength={120}
                  />
                  {errors.nombre && <ThemedText style={styles.errorText}>{errors.nombre}</ThemedText>}
                </View>

                <View style={styles.fieldGroup}>
                  <ThemedText type="small" themeColor="textSecondary">Descripción *</ThemedText>
                  <TextInput
                    style={[styles.input, styles.textArea, fieldBorder(!!errors.descripcion)]}
                    value={descripcion}
                    onChangeText={(t) => {
                      setDescripcion(t);
                      if (errors.descripcion) setErrors((p) => ({ ...p, descripcion: undefined }));
                    }}
                    placeholder="Descripción del item"
                    placeholderTextColor={theme.textSecondary}
                    multiline
                    numberOfLines={4}
                    maxLength={1000}
                  />
                  {errors.descripcion && (
                    <ThemedText style={styles.errorText}>{errors.descripcion}</ThemedText>
                  )}
                </View>
              </ThemedView>

              {/* Sección: Precio y Oferta */}
              <ThemedView type="backgroundElement" style={styles.section}>
                <ThemedText type="smallBold" style={styles.sectionTitle}>
                  Precio y Oferta
                </ThemedText>

                <View style={styles.fieldGroup}>
                  <ThemedText type="small" themeColor="textSecondary">Precio *</ThemedText>
                  <View style={[styles.inputWithIcon, fieldBorder(!!errors.precio)]}>
                    <ThemedText themeColor="textSecondary" style={styles.inputIcon}>$</ThemedText>
                    <TextInput
                      style={styles.inputInner}
                      value={precio}
                      onChangeText={(t) => {
                        setPrecio(t);
                        if (errors.precio) setErrors((p) => ({ ...p, precio: undefined }));
                      }}
                      placeholder="0.00"
                      placeholderTextColor={theme.textSecondary}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  {errors.precio && <ThemedText style={styles.errorText}>{errors.precio}</ThemedText>}
                </View>

                <View style={styles.fieldGroup}>
                  <ThemedText type="small" themeColor="textSecondary">Tipo de oferta *</ThemedText>
                  <TouchableOpacity
                    style={[styles.pickerButton, fieldBorder(false)]}
                    onPress={() => setShowTipoMenu(!showTipoMenu)}
                    activeOpacity={0.7}
                  >
                    <ThemedText style={styles.pickerText}>
                      {tipoOferta === 'money' ? 'Descuento en dinero' : 'Descuento en porcentaje'}
                    </ThemedText>
                    <ThemedText themeColor="textSecondary">{showTipoMenu ? '▲' : '▼'}</ThemedText>
                  </TouchableOpacity>
                  {showTipoMenu && (
                    <ThemedView type="backgroundSelected" style={styles.menuContainer}>
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                          setTipoOferta('money');
                          setDescuento('');
                          setShowTipoMenu(false);
                        }}
                      >
                        <ThemedText>Descuento en dinero</ThemedText>
                        {tipoOferta === 'money' && (
                          <ThemedText style={styles.checkMark}>✓</ThemedText>
                        )}
                      </TouchableOpacity>
                      <View style={[styles.menuDivider, { backgroundColor: theme.backgroundElement }]} />
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                          setTipoOferta('percentage');
                          setDescuento('');
                          setShowTipoMenu(false);
                        }}
                      >
                        <ThemedText>Descuento en porcentaje</ThemedText>
                        {tipoOferta === 'percentage' && (
                          <ThemedText style={styles.checkMark}>✓</ThemedText>
                        )}
                      </TouchableOpacity>
                    </ThemedView>
                  )}
                </View>

                <View style={styles.fieldGroup}>
                  <ThemedText type="small" themeColor="textSecondary">{descuentoLabel} *</ThemedText>
                  <View style={[styles.inputWithIcon, fieldBorder(!!errors.descuento)]}>
                    <ThemedText themeColor="textSecondary" style={styles.inputIcon}>
                      {tipoOferta === 'money' ? '$' : '%'}
                    </ThemedText>
                    <TextInput
                      style={styles.inputInner}
                      value={descuento}
                      onChangeText={(t) => {
                        setDescuento(t);
                        if (errors.descuento) setErrors((p) => ({ ...p, descuento: undefined }));
                      }}
                      placeholder={descuentoPlaceholder}
                      placeholderTextColor={theme.textSecondary}
                      keyboardType={descuentoKeyboard}
                    />
                  </View>
                  {errors.descuento && (
                    <ThemedText style={styles.errorText}>{errors.descuento}</ThemedText>
                  )}
                </View>
              </ThemedView>

              {/* Sección: Fechas */}
              <ThemedView type="backgroundElement" style={styles.section}>
                <ThemedText type="smallBold" style={styles.sectionTitle}>
                  Período de Vigencia
                </ThemedText>

                <View style={styles.datesRow}>
                  <View style={[styles.fieldGroup, styles.dateField]}>
                    <ThemedText type="small" themeColor="textSecondary">Inicio *</ThemedText>
                    <TouchableOpacity
                      style={[styles.dateButton, fieldBorder(!!errors.fechaInicio)]}
                      onPress={() => setShowFechaInicio(true)}
                      activeOpacity={0.7}
                    >
                      <ThemedText style={styles.dateText}>
                        {fechaInicio.toLocaleDateString()}
                      </ThemedText>
                    </TouchableOpacity>
                    {showFechaInicio && (
                      <DateTimePicker
                        value={fechaInicio}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(_e, date) => {
                          setShowFechaInicio(Platform.OS === 'ios');
                          if (date) {
                            setFechaInicio(date);
                            if (errors.fechaInicio) setErrors((p) => ({ ...p, fechaInicio: undefined }));
                          }
                        }}
                      />
                    )}
                    {errors.fechaInicio && (
                      <ThemedText style={styles.errorText}>{errors.fechaInicio}</ThemedText>
                    )}
                  </View>

                  <View style={[styles.fieldGroup, styles.dateField]}>
                    <ThemedText type="small" themeColor="textSecondary">Fin *</ThemedText>
                    <TouchableOpacity
                      style={[styles.dateButton, fieldBorder(!!errors.fechaFin)]}
                      onPress={() => setShowFechaFin(true)}
                      activeOpacity={0.7}
                    >
                      <ThemedText style={styles.dateText}>
                        {fechaFin.toLocaleDateString()}
                      </ThemedText>
                    </TouchableOpacity>
                    {showFechaFin && (
                      <DateTimePicker
                        value={fechaFin}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(_e, date) => {
                          setShowFechaFin(Platform.OS === 'ios');
                          if (date) {
                            setFechaFin(date);
                            if (errors.fechaFin) setErrors((p) => ({ ...p, fechaFin: undefined }));
                          }
                        }}
                      />
                    )}
                    {errors.fechaFin && (
                      <ThemedText style={styles.errorText}>{errors.fechaFin}</ThemedText>
                    )}
                  </View>
                </View>
              </ThemedView>

              {/* Sección: Multimedia */}
              <ThemedView type="backgroundElement" style={styles.section}>
                <ThemedText type="smallBold" style={styles.sectionTitle}>
                  Multimedia
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.mediaHint}>
                  Sube imágenes o videos desde la cámara o galería
                </ThemedText>

                <View style={styles.mediaButtons}>
                  <TouchableOpacity
                    style={[styles.mediaButton, { backgroundColor: theme.background }]}
                    onPress={() => pickMedia(true)}
                    activeOpacity={0.7}
                  >
                    <ThemedText style={styles.mediaButtonEmoji}>📷</ThemedText>
                    <ThemedText type="smallBold" style={styles.mediaButtonLabel}>Cámara</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.mediaButton, { backgroundColor: theme.background }]}
                    onPress={() => pickMedia(false)}
                    activeOpacity={0.7}
                  >
                    <ThemedText style={styles.mediaButtonEmoji}>🖼️</ThemedText>
                    <ThemedText type="smallBold" style={styles.mediaButtonLabel}>Galería</ThemedText>
                  </TouchableOpacity>
                </View>
                {errors.multimedia && (
                  <ThemedText style={styles.errorText}>{errors.multimedia}</ThemedText>
                )}

                {media.length > 0 && (
                  <View style={styles.mediaGrid}>
                    {media.map((m, i) => (
                      <View key={i} style={styles.mediaPreviewCard}>
                        {m.type.startsWith('image') ? (
                          <Image source={{ uri: m.uri }} style={styles.mediaThumb} />
                        ) : (
                          <View style={[styles.mediaThumb, styles.videoThumb, { backgroundColor: theme.background }]}>
                            <ThemedText style={styles.videoIcon}>🎬</ThemedText>
                          </View>
                        )}
                        <TouchableOpacity
                          style={styles.mediaRemoveBtn}
                          onPress={() => removeMedia(i)}
                        >
                          <ThemedText style={styles.mediaRemoveBtnText}>✕</ThemedText>
                        </TouchableOpacity>
                        <ThemedText type="small" numberOfLines={1} style={styles.mediaFileName}>
                          {m.name}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                )}
              </ThemedView>

              {/* Botón Submit */}
              <View style={styles.submitContainer}>
                <TouchableOpacity
                  style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={submitting}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.submitButtonText}>
                    {submitting ? 'Enviando...' : 'Crear Item'}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <View style={styles.bottomSpacer} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  form: {
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.one,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#208AEF',
  },
  headerText: {
    flex: 1,
  },
  heading: {
    fontSize: 26,
    lineHeight: 32,
  },
  section: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  sectionTitle: {
    fontSize: 15,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  fieldGroup: {
    gap: Spacing.one,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 4,
    fontSize: 16,
  },
  inputWithIcon: {
    borderWidth: 1.5,
    borderRadius: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
  },
  inputIcon: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: Spacing.two,
  },
  inputInner: {
    flex: 1,
    paddingVertical: Spacing.two + 4,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerButton: {
    borderWidth: 1.5,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
  },
  menuContainer: {
    borderRadius: Spacing.two,
    overflow: 'hidden',
    marginTop: -Spacing.one,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  menuDivider: {
    height: 1,
  },
  checkMark: {
    color: '#208AEF',
    fontWeight: '700',
  },
  datesRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  dateField: {
    flex: 1,
  },
  dateButton: {
    borderWidth: 1.5,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 15,
  },
  mediaHint: {
    marginTop: -Spacing.one,
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  mediaButton: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
    gap: Spacing.one,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  mediaButtonEmoji: {
    fontSize: 28,
  },
  mediaButtonLabel: {
    fontSize: 13,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  mediaPreviewCard: {
    width: '48%',
    position: 'relative',
  },
  mediaThumb: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Spacing.two,
  },
  videoThumb: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoIcon: {
    fontSize: 32,
  },
  mediaRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaRemoveBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  mediaFileName: {
    marginTop: Spacing.one,
    fontSize: 11,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
  },
  submitContainer: {
    paddingTop: Spacing.two,
  },
  submitButton: {
    backgroundColor: '#208AEF',
    paddingVertical: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
    shadowColor: '#208AEF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  bottomSpacer: {
    height: Spacing.six,
  },
});
