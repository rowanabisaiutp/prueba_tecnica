import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AccentBlue, Spacing } from '@/constants/theme';

type Props = {
  title: string;
  loading?: boolean;
  onPress: () => void;
  disabled?: boolean;
};

export function SubmitButton({ title, loading, onPress, disabled }: Props) {
  return (
    <TouchableOpacity
      style={[styles.submitButton, disabled && styles.submitButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <ThemedText style={styles.submitButtonText}>
        {loading ? 'Enviando...' : title}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  submitButton: {
    backgroundColor: AccentBlue,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
    shadowColor: AccentBlue,
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
});
