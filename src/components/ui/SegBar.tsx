import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Icon } from './Icon';

type Option = {
  value: string;
  label: string;
  icon?: string;
};

type Props = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
};

export function SegBar({ options, value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {options.map(o => {
        const on = o.value === value;
        return (
          <TouchableOpacity
            key={o.value}
            onPress={() => onChange(o.value)}
            activeOpacity={0.8}
            style={[styles.option, on ? styles.optionActive : undefined]}
          >
            {o.icon && <Icon name={o.icon} size={18} color={on ? Colors.azul : Colors.txt2} />}
            <Text style={[styles.text, { color: on ? Colors.azul : Colors.txt2, fontWeight: on ? '800' : '600' }]}>
              {o.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    backgroundColor: '#EAEDF3',
    borderRadius: 13,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  optionActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#12203C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  text: {
    fontSize: 14,
  },
});
