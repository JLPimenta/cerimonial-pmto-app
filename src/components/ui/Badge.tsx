import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

type Tom = 'cinza' | 'azul' | 'ouro' | 'ok';

type Props = {
  children: React.ReactNode;
  tom?: Tom;
  solid?: boolean;
};

const MAP: Record<Tom, { bg: string; fg: string }> = {
  cinza: { bg: '#EEF0F4', fg: Colors.txt2 },
  azul: { bg: Colors.azulTint, fg: Colors.azul },
  ouro: { bg: Colors.ouroTint, fg: Colors.ouroEsc },
  ok: { bg: '#E4F2EA', fg: Colors.ok },
};

export function Badge({ children, tom = 'cinza', solid }: Props) {
  const { bg, fg } = MAP[tom];
  return (
    <View style={[styles.base, { backgroundColor: solid ? fg : bg }]}>
      <Text style={[styles.text, { color: solid ? '#fff' : fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
});
