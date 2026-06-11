import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ErrorRed, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  multiline?: boolean;
  maxLength?: number;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  icon?: string;
};

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline,
  maxLength,
  keyboardType,
  icon,
}: Props) {
  const theme = useTheme();
  const borderColor = error ? ErrorRed : theme.backgroundElement;
  const bgColor = theme.background;

  return (
    <View style={styles.fieldGroup}>
      <ThemedText type="small" themeColor="textSecondary">{label}</ThemedText>
      {icon ? (
        <View style={[styles.inputWithIcon, { borderColor, backgroundColor: bgColor }]}>
          <ThemedText themeColor="textSecondary" style={styles.inputIcon}>{icon}</ThemedText>
          <TextInput
            style={styles.inputInner}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.textSecondary}
            keyboardType={keyboardType}
          />
        </View>
      ) : (
        <TextInput
          style={[
            styles.input,
            { borderColor, backgroundColor: bgColor, color: theme.text },
            multiline && styles.textArea,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          multiline={multiline}
          numberOfLines={multiline ? 4 : undefined}
          maxLength={maxLength}
          keyboardType={keyboardType}
        />
      )}
      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
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
  errorText: {
    color: ErrorRed,
    fontSize: 12,
  },
});
