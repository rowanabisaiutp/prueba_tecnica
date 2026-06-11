import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DatePickerField } from '@/components/date-picker-field';
import { FormField } from '@/components/form-field';
import { MediaPickerGrid } from '@/components/media-picker-grid';
import { SubmitButton } from '@/components/submit-button';
import { TipoOfertaPicker } from '@/components/tipo-oferta-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AccentBlue, AccentBlueLight, MaxContentWidth, Spacing } from '@/constants/theme';
import { useCreateItemForm } from '@/hooks/use-create-item-form';

export default function CreateScreen() {
  const form = useCreateItemForm();

  const descuentoLabel = form.tipoOferta === 'money' ? 'Descuento en dinero ($)' : 'Descuento en porcentaje (%)';
  const descuentoPlaceholder = form.tipoOferta === 'money' ? 'Ej: 500' : 'Ej: 15';
  const descuentoKeyboard = form.tipoOferta === 'percentage' ? 'numeric' as const : 'decimal-pad' as const;
  const descuentoIcon = form.tipoOferta === 'money' ? '$' : '%';

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
                <View style={[styles.headerIcon, { backgroundColor: AccentBlueLight }]}>
                  <ThemedText style={styles.headerIconText}>+</ThemedText>
                </View>
                <View style={styles.headerText}>
                  <ThemedText type="subtitle" style={styles.heading}>Nuevo Item</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Completa todos los campos para crear un item
                  </ThemedText>
                </View>
              </View>

              <ThemedView type="backgroundElement" style={styles.section}>
                <ThemedText type="smallBold" style={styles.sectionTitle}>
                  Información General
                </ThemedText>
                <FormField
                  label="Nombre *"
                  value={form.nombre}
                  onChangeText={(t) => { form.setNombre(t); form.clearFieldError('nombre'); }}
                  placeholder="Nombre del item"
                  error={form.errors.nombre}
                  maxLength={120}
                />
                <FormField
                  label="Descripción *"
                  value={form.descripcion}
                  onChangeText={(t) => { form.setDescripcion(t); form.clearFieldError('descripcion'); }}
                  placeholder="Descripción del item"
                  error={form.errors.descripcion}
                  multiline
                  maxLength={1000}
                />
              </ThemedView>

              <ThemedView type="backgroundElement" style={styles.section}>
                <ThemedText type="smallBold" style={styles.sectionTitle}>
                  Precio y Oferta
                </ThemedText>
                <FormField
                  label="Precio *"
                  value={form.precio}
                  onChangeText={(t) => { form.setPrecio(t); form.clearFieldError('precio'); }}
                  placeholder="0.00"
                  error={form.errors.precio}
                  keyboardType="decimal-pad"
                  icon="$"
                />
                <TipoOfertaPicker
                  value={form.tipoOferta}
                  showMenu={form.showTipoMenu}
                  onToggleMenu={() => form.setShowTipoMenu(!form.showTipoMenu)}
                  onSelect={(v) => { form.setTipoOferta(v); form.setDescuento(''); form.setShowTipoMenu(false); }}
                  hasError={false}
                />
                <FormField
                  label={`${descuentoLabel} *`}
                  value={form.descuento}
                  onChangeText={(t) => { form.setDescuento(t); form.clearFieldError('descuento'); }}
                  placeholder={descuentoPlaceholder}
                  error={form.errors.descuento}
                  keyboardType={descuentoKeyboard}
                  icon={descuentoIcon}
                />
              </ThemedView>

              <ThemedView type="backgroundElement" style={styles.section}>
                <ThemedText type="smallBold" style={styles.sectionTitle}>
                  Período de Vigencia
                </ThemedText>
                <View style={styles.datesRow}>
                  <DatePickerField
                    label="Inicio"
                    value={form.fechaInicio}
                    show={form.showFechaInicio}
                    onToggle={() => form.setShowFechaInicio(Platform.OS === 'ios')}
                    onChange={(d) => { form.setFechaInicio(d); form.clearFieldError('fechaInicio'); }}
                    error={form.errors.fechaInicio}
                  />
                  <DatePickerField
                    label="Fin"
                    value={form.fechaFin}
                    show={form.showFechaFin}
                    onToggle={() => form.setShowFechaFin(Platform.OS === 'ios')}
                    onChange={(d) => { form.setFechaFin(d); form.clearFieldError('fechaFin'); }}
                    error={form.errors.fechaFin}
                  />
                </View>
              </ThemedView>

              <MediaPickerGrid
                media={form.media}
                error={form.errors.multimedia}
                onPickFromCamera={() => form.pickMedia(true)}
                onPickFromGallery={() => form.pickMedia(false)}
                onRemove={form.removeMedia}
              />

              <View style={styles.submitContainer}>
                <SubmitButton
                  title="Crear Item"
                  loading={form.submitting}
                  onPress={form.handleSubmit}
                  disabled={form.submitting}
                />
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
  container: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
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
    color: AccentBlue,
  },
  headerText: { flex: 1 },
  heading: { fontSize: 26, lineHeight: 32 },
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
  datesRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  submitContainer: { paddingTop: Spacing.two },
  bottomSpacer: { height: Spacing.six },
});
