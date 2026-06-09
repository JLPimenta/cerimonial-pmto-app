import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { Icon } from './Icon';

type Variant = 'primary' | 'ouro' | 'ghost' | 'quiet' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: Variant;
  icon?: string;
  full?: boolean;
  size?: Size;
  disabled?: boolean;
};

const VARIANTS: Record<Variant, { bg: string; color: string; border: string }> = {
  primary: { bg: Colors.azul, color: '#fff', border: Colors.azul },
  ouro: { bg: Colors.ouro, color: '#fff', border: Colors.ouro },
  ghost: { bg: Colors.surface, color: Colors.azul, border: Colors.bordaForte },
  quiet: { bg: 'transparent', color: Colors.txt2, border: 'transparent' },
  danger: { bg: Colors.dangerBg, color: Colors.danger, border: Colors.dangerBorder },
};

const SIZES: Record<Size, { paddingVertical: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { paddingVertical: 8, paddingHorizontal: 13, fontSize: 14 },
  md: { paddingVertical: 12, paddingHorizontal: 17, fontSize: 15.5 },
  lg: { paddingVertical: 15, paddingHorizontal: 20, fontSize: 16.5 },
};

export function Button({ children, onPress, variant = 'primary', icon, full, size = 'md', disabled }: Props) {
  const v = VARIANTS[variant];
  const s = SIZES[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
        },
        full ? styles.full : undefined,
        disabled ? styles.disabled : undefined,
      ]}
    >
      {icon && <Icon name={icon} size={s.fontSize + 3} color={v.color} />}
      <Text style={[styles.text, { color: v.color, fontSize: s.fontSize }]}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRadius: 13,
    borderWidth: 1,
  },
  full: {
    width: '100%',
  },
  disabled: {
    opacity: 0.45,
  },
  text: {
    fontWeight: '700',
  },
});
