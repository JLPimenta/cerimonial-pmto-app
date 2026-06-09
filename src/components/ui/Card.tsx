import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: object;
  pad?: number;
};

export function Card({ children, onPress, style, pad = 16 }: Props) {
  const inner = (
    <View style={[styles.base, { padding: pad }, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        {inner}
      </TouchableOpacity>
    );
  }

  return inner;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.borda,
    ...Colors.shadow,
  },
});
