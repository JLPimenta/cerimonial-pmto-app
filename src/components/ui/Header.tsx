import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Icon } from './Icon';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  accent?: boolean;
};

export function Header({ title, subtitle, onBack, right, accent }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Icon name="arrow_back" size={24} color={Colors.txt} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 4 }} />
        )}
        <View style={styles.titleBox}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right ?? null}
      </View>
      {accent && <View style={styles.accentBar} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borda,
    paddingHorizontal: 12,
    paddingBottom: 12,
    zIndex: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  titleBox: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontWeight: '800',
    fontSize: 18,
    color: Colors.txt,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 12.5,
    color: Colors.txt3,
    marginTop: 1,
  },
  accentBar: {
    height: 3,
    borderRadius: 2,
    marginTop: 10,
    // Gradient via a simple 2-color approach isn't native — use a View with color
    backgroundColor: Colors.azul,
  },
});
