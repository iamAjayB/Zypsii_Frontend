import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../utils';

const ParticipantItem = ({ item, onMarkAsPaid }) => {
  return (
    <View style={styles.participantItem}>
      <View style={styles.participantInfo}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.user?.email ? item.user.email[0].toUpperCase() : '?'}
          </Text>
        </View>
        <View style={styles.participantDetails}>
          <Text style={styles.participantName}>{item.user?.email || 'Unknown User'}</Text>
          <Text style={styles.participantContact}>Amount: ₹{item.amount || 0}</Text>
          <Text style={[
            styles.paymentStatus,
            { color: item.paid ? colors.greenColor : colors.error }
          ]}>
            {item.paid ? 'Paid' : 'Pending'}
          </Text>
        </View>
      </View>
      {!item.paid && (
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => onMarkAsPaid(item._id)}
        >
          <Text style={styles.payButtonText}>Mark as Paid</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.grayLinesColor,
    borderRadius: 8,
    marginBottom: 8,
  },
  participantInfo: {
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.btncolor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.fontMainColor,
    marginBottom: 4,
  },
  participantContact: {
    fontSize: 12,
    color: colors.fontSecondColor,
  },
  paymentStatus: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  payButton: {
    backgroundColor: colors.btncolor,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  payButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ParticipantItem; 