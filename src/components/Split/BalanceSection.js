import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../utils';

const BalanceSection = ({ balanceData, loadingBalance }) => {
  if (loadingBalance) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.btncolor} />
      </View>
    );
  }

  if (!balanceData || !balanceData.data || balanceData.data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No balance due</Text>
      </View>
    );
  }

  return (
    <View style={styles.balanceSection}>
      <View style={styles.balanceHeader}>
        <Text style={styles.balanceTitle}>Total Balance Due</Text>
        <Text style={styles.totalAmount}>₹{balanceData.totalBalanceDueAcrossSplit?.toFixed(2) || '0.00'}</Text>
      </View>

      <FlatList
        data={balanceData.data}
        renderItem={({ item }) => (
          <View style={styles.balanceCard}>
            <View style={styles.balanceCardHeader}>
              <View style={styles.balanceCardInfo}>
                <Text style={styles.balanceCardTitle}>{item.description}</Text>
                <Text style={styles.balanceCardCategory}>{item.category}</Text>
              </View>
              <View style={styles.balanceCardAmounts}>
                <Text style={styles.balanceCardTotal}>₹{item.totalExpenseAmount?.toFixed(2)}</Text>
                <Text style={styles.balanceCardDue}>Due: ₹{item.totalDueInExpense?.toFixed(2)}</Text>
              </View>
            </View>

            {/* Paid By Information */}
            <View style={styles.paidByInfo}>
              <Text style={styles.paidByLabel}>
                Paid by <Text style={styles.paidByName}>{item.paidBy?.fullName}</Text>
              </Text>
            </View>

            {/* Paid Members */}
            {item.paidByMembers && item.paidByMembers.length > 0 && (
              <View style={styles.paidMembersList}>
                <Text style={styles.membersSectionLabel}>Paid Members</Text>
                {item.paidByMembers?.map((member, index) => (
                  <View key={member.memberId || index} style={styles.paidMemberItem}>
                    <View style={styles.paidMemberInfo}>
                      <View style={styles.paidMemberAvatar}>
                        <Text style={styles.paidMemberAvatarText}>
                          {member.fullName?.charAt(0).toUpperCase() || '?'}
                        </Text>
                      </View>
                      <View style={styles.paidMemberDetails}>
                        <Text style={styles.paidMemberName}>{member.fullName}</Text>
                        <Text style={styles.paidMemberEmail}>{member.email}</Text>
                      </View>
                    </View>
                    <Text style={styles.paidMemberAmount}>₹{member.amount?.toFixed(2)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Due Members */}
            <View style={styles.dueMembersList}>
              <Text style={styles.membersSectionLabel}>Due by Members</Text>
              {item.dueByMembers?.map((member, index) => (
                <View key={member.memberId || index} style={styles.dueMemberItem}>
                  <View style={styles.dueMemberInfo}>
                    <View style={styles.dueMemberAvatar}>
                      <Text style={styles.dueMemberAvatarText}>
                        {member.fullName?.charAt(0).toUpperCase() || '?'}
                      </Text>
                    </View>
                    <View style={styles.dueMemberDetails}>
                      <Text style={styles.dueMemberName}>{member.fullName}</Text>
                      <Text style={styles.dueMemberEmail}>{member.email}</Text>
                    </View>
                  </View>
                  <Text style={styles.dueMemberAmount}>₹{member.amountDue?.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        keyExtractor={(item) => item.expenseId}
        contentContainerStyle={styles.balanceList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.fontSecondColor,
    textAlign: 'center',
    lineHeight: 24,
  },
  balanceSection: {
    flex: 1,
    padding: 16,
  },
  balanceHeader: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceTitle: {
    fontSize: 16,
    color: colors.fontSecondColor,
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.fontMainColor,
  },
  balanceCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.grayLinesColor,
  },
  balanceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  balanceCardInfo: {
    flex: 1,
    marginRight: 12,
  },
  balanceCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.fontMainColor,
    marginBottom: 4,
  },
  balanceCardCategory: {
    fontSize: 14,
    color: colors.fontSecondColor,
  },
  balanceCardAmounts: {
    alignItems: 'flex-end',
  },
  balanceCardTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.fontMainColor,
    marginBottom: 4,
  },
  balanceCardDue: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '500',
  },
  dueMembersList: {
    borderTopWidth: 1,
    borderTopColor: colors.grayBackground,
    paddingTop: 12,
  },
  dueMemberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dueMemberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dueMemberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.btncolor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  dueMemberAvatarText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  dueMemberDetails: {
    flex: 1,
  },
  dueMemberName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.fontMainColor,
    marginBottom: 2,
  },
  dueMemberEmail: {
    fontSize: 12,
    color: colors.fontSecondColor,
  },
  dueMemberAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  paidByInfo: {
    marginBottom: 12,
  },
  paidByLabel: {
    fontSize: 14,
    color: colors.fontSecondColor,
  },
  paidByName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.fontMainColor,
  },
  paidMembersList: {
    marginBottom: 12,
  },
  membersSectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.fontMainColor,
    marginBottom: 8,
  },
  paidMemberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paidMemberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paidMemberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.btncolor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  paidMemberAvatarText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  paidMemberDetails: {
    flex: 1,
  },
  paidMemberName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.fontMainColor,
    marginBottom: 2,
  },
  paidMemberEmail: {
    fontSize: 12,
    color: colors.fontSecondColor,
  },
  paidMemberAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
});

export default BalanceSection; 