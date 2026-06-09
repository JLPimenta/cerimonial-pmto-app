import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Icon } from './Icon';

type Props = {
  icon?: string;
  label?: string;
  onPress: () => void;
};

export function Fab({ icon = 'add', label, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.fab, !label ? styles.round : undefined]}>
      <Icon name={icon} size={24} color="#fff" />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 17,
    backgroundColor: Colors.azul,
    shadowColor: Colors.azul,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
    zIndex: 30,
  },
  round: {
    paddingHorizontal: 15,
  },
  label: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15.5,
  },
});
