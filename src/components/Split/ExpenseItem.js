import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils';

const ExpenseItem = ({ 
  item, 
  editingExpenseId, 
  editedAmount, 
  isUpdatingExpense,
  onEditPress,
  onUpdateExpense,
  onCancelEdit 
}) => {
  // If paidBy is an object, use it. If it's an ID, find the user in participants.
  let paidByUser = item.paidBy;
  if (typeof paidByUser === 'string' && item.participants) {
    const found = item.participants.find(p => p.user?._id === paidByUser);
    paidByUser = found ? found.user : null;
  }
  
  // Format date properly
  const expenseDate = item.date ? new Date(item.date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) : 'No date';

  // Defensive checks for amount and description
  const safeAmount = (item.amount !== undefined && item.amount !== null && !isNaN(Number(item.amount))) ? parseFloat(item.amount).toFixed(2) : '0.00';
  const safeDescription = item.description && item.description.trim() ? item.description : 'No description';

  return (
    <View style={styles.expenseItem}>
      <View style={styles.expenseHeader}>
        <View style={styles.expenseMainInfo}>
          <Text style={styles.expenseDescription} numberOfLines={2}>
            {safeDescription}
          </Text>
          {editingExpenseId === item._id ? (
            <View style={styles.amountEditContainer}>
              <TextInput
                style={styles.amountInput}
                value={editedAmount}
                onChangeText={onEditPress}
                keyboardType="numeric"
                autoFocus
                placeholder="Enter amount"
                placeholderTextColor={colors.fontSecondColor}
              />
              <View style={styles.amountEditButtons}>
                {isUpdatingExpense ? (
                  <ActivityIndicator size="small" color={colors.Zypsii_color} />
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.amountEditButton, styles.saveButton]}
                      onPress={() => onUpdateExpense(item._id, editedAmount)}
                    >
                      <Ionicons name="checkmark" size={20} color={colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.amountEditButton, styles.cancelButton]}
                      onPress={onCancelEdit}
                    >
                      <Ionicons name="close" size={20} color={colors.white} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              onPress={() => onEditPress(item._id, item.amount ? item.amount.toString() : '')}
            >
              <Text style={styles.expenseAmount}>₹{safeAmount}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.expenseDetails}>
        <View style={styles.expenseDetailRow}>
          <View style={styles.expenseDetailItem}>
            <Ionicons name="calendar-outline" size={16} color={colors.fontSecondColor} />
            <Text style={styles.expenseDetailText}>{expenseDate}</Text>
          </View>
          <View style={styles.expenseDetailItem}>
            <Ionicons name="pricetag-outline" size={16} color={colors.fontSecondColor} />
            <Text style={styles.expenseDetailText}>{item.category || 'Other'}</Text>
          </View>
        </View>

        <View style={styles.paidByContainer}>
          <View style={styles.paidByInfo}>
            <View style={styles.paidByAvatar}>
              <Text style={styles.paidByAvatarText}>
                {paidByUser?.name ? paidByUser.name.charAt(0).toUpperCase() : 
                 paidByUser?.email ? paidByUser.email.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            <View style={styles.paidByTextContainer}>
              <Text style={styles.paidByLabel}>Paid by</Text>
              <Text style={[styles.paidByEmail, { color: colors.Zypsii_color }]} numberOfLines={1}>
                {paidByUser?.name || paidByUser?.email || 'Unknown user'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  expenseItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grayLinesColor,
  },
  expenseHeader: {
    marginBottom: 12,
  },
  expenseMainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.fontMainColor,
    flex: 1,
    marginRight: 12,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.Zypsii_color,
  },
  expenseDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.grayBackground,
    paddingTop: 12,
    gap: 12,
  },
  expenseDetailRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
  },
  expenseDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expenseDetailText: {
    fontSize: 13,
    color: colors.fontSecondColor,
  },
  paidByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paidByInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paidByAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.Zypsii_color,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paidByAvatarText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  paidByTextContainer: {
    justifyContent: 'center',
  },
  paidByLabel: {
    fontSize: 12,
    color: colors.fontSecondColor,
    marginBottom: 2,
  },
  paidByEmail: {
    fontSize: 13,
    color: colors.Zypsii_color,
    fontWeight: '500',
  },
  amountEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  amountEditButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountEditButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: colors.Zypsii_color,
  },
  cancelButton: {
    backgroundColor: colors.error,
  },
  amountInput: {
    width: 80,
    textAlign: 'right',
    fontSize: 16,
    color: colors.fontMainColor,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.grayLinesColor,
    borderRadius: 8,
  },
});

export default ExpenseItem; 