import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ErrorRed, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  label: string;
  value: Date;
  show: boolean;
  onToggle: () => void;
  onChange: (date: Date) => void;
  error?: string;
};

export function DatePickerField({ label, value, show, onToggle, onChange, error }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.fieldGroup, styles.dateField]}>
      <ThemedText type="small" themeColor="textSecondary">{label} *</ThemedText>
      <TouchableOpacity
        style={[styles.dateButton, { borderColor: error ? ErrorRed : theme.backgroundElement, backgroundColor: theme.background }]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <ThemedText style={styles.dateText}>
          {value.toLocaleDateString()}
        </ThemedText>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_e, date) => {
            onToggle();
            if (date) onChange(date);
          }}
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
  errorText: {
    color: ErrorRed,
    fontSize: 12,
  },
});
