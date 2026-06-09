import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

type Props = {
  label: string;
  children: React.ReactNode;
  hint?: string;
};

export function Field({ label, children, hint }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export const inputStyle = {
  backgroundColor: Colors.surface,
  borderWidth: 1,
  borderColor: Colors.bordaForte,
  borderRadius: 13,
  paddingHorizontal: 14,
  paddingVertical: 13,
  fontSize: 15.5,
  color: Colors.txt,
} as const;

const styles = StyleSheet.create({
  container: {
    gap: 7,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.txt2,
  },
  hint: {
    fontSize: 12,
    color: Colors.txt3,
    marginTop: 6,
  },
});
