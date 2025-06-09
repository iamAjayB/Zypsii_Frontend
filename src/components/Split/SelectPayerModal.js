import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils';

const SelectPayerModal = ({ visible, onClose, participants, selectedPayer, onSelectPayer }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.fontMainColor} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Who paid?</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          <ScrollView style={styles.modalBody}>
            {participants?.map((participant) => (
              <TouchableOpacity
                key={participant.user?._id}
                style={styles.payerSelectItem}
                onPress={() => onSelectPayer(participant.user?._id)}
              >
                <View style={styles.payerInfo}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {participant.user?.fullName
                        ? participant.user.fullName.charAt(0).toUpperCase()
                        : participant.user?.name
                        ? participant.user.name.charAt(0).toUpperCase()
                        : participant.user?.email
                        ? participant.user.email.charAt(0).toUpperCase()
                        : '?'}
                    </Text>
                  </View>
                  <Text style={styles.payerName}>
                    {participant.user?.fullName || participant.user?.name || (participant.user?.email ? participant.user.email.split('@')[0] : '') || 'User'}
                  </Text>
                </View>
                <View style={[
                  styles.checkbox,
                  selectedPayer === participant.user?._id && styles.checkboxSelected
                ]}>
                  {selectedPayer === participant.user?._id && (
                    <Ionicons name="checkmark" size={18} color={colors.white} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
  },
  closeButton: {
    padding: 8,
    backgroundColor: colors.grayBackground,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.fontMainColor,
    textAlign: 'center',
    flex: 1,
  },
  headerPlaceholder: {
    width: 70,
  },
  modalBody: {
    flex: 1,
  },
  payerSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLinesColor,
  },
  payerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.Zypsii_color,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  payerName: {
    fontSize: 16,
    color: colors.fontMainColor,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.grayLinesColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.Zypsii_color,
    borderColor: colors.Zypsii_color,
  },
});

export default SelectPayerModal; 