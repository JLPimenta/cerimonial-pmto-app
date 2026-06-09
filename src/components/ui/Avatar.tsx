import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

type Tom = 'ouro' | 'azul' | 'cinza';

type Props = {
  ini: string;
  size?: number;
  tom?: Tom;
  ring?: string;
};

const CORES: Record<Tom, { bg: string; fg: string }> = {
  ouro: { bg: Colors.ouroTint, fg: Colors.ouroEsc },
  azul: { bg: Colors.azulTint, fg: Colors.azul },
  cinza: { bg: '#EDEFF4', fg: Colors.txt2 },
};

export function Avatar({ ini, size = 40, tom = 'cinza', ring }: Props) {
  const { bg, fg } = CORES[tom];
  return (
    <View style={[
      styles.base,
      { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
      ring ? { borderWidth: 2.5, borderColor: ring } : undefined,
    ]}>
      <Text style={[styles.text, { color: fg, fontSize: size * 0.36 }]}>{ini}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
