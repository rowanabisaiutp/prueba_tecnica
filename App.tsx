import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>MiProyecto</Text>
      <Text style={styles.subtitle}>
        Base preparada para React Native + Expo + TypeScript.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F7F7FB',
  },
  title: {
    marginBottom: 12,
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
  },
});
