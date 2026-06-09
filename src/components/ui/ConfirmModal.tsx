import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Colors } from '../../constants/colors';
import { Icon } from './Icon';
import { Button } from './Button';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
};

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Excluir',
  danger = true,
}: Props) {
  return (
    <Modal transparent visible={open} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <View style={styles.iconBox}>
                <View style={[styles.iconCircle, { backgroundColor: danger ? Colors.dangerBg : Colors.azulTint }]}>
                  <Icon
                    name={danger ? 'delete' : 'help'}
                    size={26}
                    color={danger ? Colors.danger : Colors.azul}
                  />
                </View>
                <Text style={styles.title}>{title}</Text>
                {message ? <Text style={styles.message}>{message}</Text> : null}
              </View>
              <View style={styles.actions}>
                <Button full variant="ghost" onPress={onClose}>Cancelar</Button>
                <Button full variant={danger ? 'danger' : 'primary'} onPress={onConfirm}>
                  {confirmLabel}
                </Button>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18,28,46,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    width: '100%',
    maxWidth: 320,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35,
    shadowRadius: 60,
    elevation: 20,
  },
  iconBox: {
    padding: 22,
    paddingBottom: 18,
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.txt,
    textAlign: 'center',
  },
  message: {
    fontSize: 13.5,
    color: Colors.txt2,
    marginTop: 6,
    lineHeight: 19,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    paddingTop: 0,
  },
});
