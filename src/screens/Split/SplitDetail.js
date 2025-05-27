import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSplitDetails,
  addExpense,
  updateExpense,
  markAsPaid,
  inviteFriend,
  setActiveTab,
  setAddParticipantModalVisible,
  setAddExpenseModalVisible,
  setInviteModalVisible,
  setEditingExpenseId,
  setEditedAmount,
} from '../../redux/slices/splitSlice';

// Import components
import AddParticipantModal from '../../components/Split/AddParticipantModal';
import SelectPayerModal from '../../components/Split/SelectPayerModal';
import AddExpenseModal from '../../components/Split/AddExpenseModal';
import ExpenseItem from '../../components/Split/ExpenseItem';
import ParticipantItem from '../../components/Split/ParticipantItem';

function SplitDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { splitId } = route.params;

  const {
    currentSplit: split,
    loading,
    error,
    activeTab,
    isAddParticipantModalVisible,
    isAddExpenseModalVisible,
    isInviteModalVisible,
    editingExpenseId,
    editedAmount,
  } = useSelector((state) => state.split);

  useEffect(() => {
    dispatch(fetchSplitDetails(splitId));
  }, [splitId, dispatch]);

  const handleUpdateExpense = async (expenseId, newAmount) => {
    try {
      if (!newAmount || isNaN(parseFloat(newAmount)) || parseFloat(newAmount) <= 0) {
        Alert.alert('Error', 'Please enter a valid amount');
        return;
      }

      await dispatch(updateExpense({ splitId, expenseId, newAmount })).unwrap();
      Alert.alert('Success', 'Expense amount updated successfully');
    } catch (error) {
      console.error('Error updating expense:', error);
      Alert.alert('Error', error.message || 'Failed to update expense');
    }
  };

  const handleAddExpense = async (expenseData) => {
    try {
      if (!expenseData.description || !expenseData.description.trim()) {
        throw new Error('Description is required');
      }

      if (!expenseData.amount || isNaN(expenseData.amount) || expenseData.amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (!expenseData.category || !expenseData.category.trim()) {
        throw new Error('Category is required');
      }

      await dispatch(addExpense({ splitId, expenseData })).unwrap();
      Alert.alert('Success', 'Expense added successfully');
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', error.message || 'Failed to add expense');
    }
  };

  const handleMarkAsPaid = async (participantId) => {
    try {
      await dispatch(markAsPaid({ splitId, participantId })).unwrap();
      Alert.alert('Success', 'Payment marked as completed');
    } catch (error) {
      console.error('Error marking payment:', error);
      Alert.alert('Error', error.message || 'Failed to mark payment');
    }
  };

  const handleInviteFriend = async (email, name) => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter email');
      return;
    }

    try {
      await dispatch(inviteFriend({ splitId, email, name })).unwrap();
      Alert.alert('Success', 'Invitation sent successfully');
      dispatch(setInviteModalVisible(false));
    } catch (error) {
      console.error('Error inviting friend:', error);
      Alert.alert('Error', error.message || 'Failed to send invitation');
    }
  };

  if (loading || !split) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.fontMainColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{split.title}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => dispatch(setAddParticipantModalVisible(true))}
          >
            <Ionicons name="person-add" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Total Expenses</Text>
        <Text style={styles.totalAmount}>₹{split.totalAmount}</Text>
        <Text style={styles.participantsText}>{split.participants.length} participants</Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'participants' && styles.activeTab]}
          onPress={() => dispatch(setActiveTab('participants'))}
        >
          <Ionicons 
            name="people-outline" 
            size={20} 
            color={activeTab === 'participants' ? colors.btncolor : colors.fontSecondColor} 
          />
          <Text style={[styles.tabText, activeTab === 'participants' && styles.activeTabText]}>
            Participants
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'expenses' && styles.activeTab]}
          onPress={() => dispatch(setActiveTab('expenses'))}
        >
          <Ionicons 
            name="receipt-outline" 
            size={20} 
            color={activeTab === 'expenses' ? colors.btncolor : colors.fontSecondColor} 
          />
          <Text style={[styles.tabText, activeTab === 'expenses' && styles.activeTabText]}>
            Expenses
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'expenses' ? (
        <>
          <FlatList
            data={split.expenses}
            renderItem={({ item }) => (
              <ExpenseItem
                item={item}
                editingExpenseId={editingExpenseId}
                editedAmount={editedAmount}
                isUpdatingExpense={false}
                onEditPress={() => {
                  dispatch(setEditingExpenseId(item._id));
                  dispatch(setEditedAmount(item.amount ? item.amount.toString() : ''));
                }}
                onUpdateExpense={handleUpdateExpense}
                onCancelEdit={() => {
                  dispatch(setEditingExpenseId(null));
                  dispatch(setEditedAmount(''));
                }}
              />
            )}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No expenses added yet</Text>
              </View>
            }
          />
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => dispatch(setAddExpenseModalVisible(true))}
          >
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
        </>
      ) : (
        <FlatList
          data={split.participants}
          renderItem={({ item }) => (
            <ParticipantItem
              item={item}
              onMarkAsPaid={handleMarkAsPaid}
            />
          )}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <AddParticipantModal
        visible={isAddParticipantModalVisible}
        onClose={() => dispatch(setAddParticipantModalVisible(false))}
        onAddParticipant={() => {}}
        existingParticipants={split?.participants || []}
      />

      <Modal
        visible={isInviteModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => dispatch(setInviteModalVisible(false))}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Invite Friend</Text>
            <TextInput
              style={styles.input}
              placeholder="Friend's Email"
              value={''}
              onChangeText={(text) => {}}
              keyboardType="email-address"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => dispatch(setInviteModalVisible(false))}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.inviteButton]}
                onPress={() => {}}
              >
                <Text style={styles.inviteButtonText}>Invite</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AddExpenseModal
        visible={isAddExpenseModalVisible}
        onClose={() => dispatch(setAddExpenseModalVisible(false))}
        onAddExpense={handleAddExpense}
        participants={split?.participants || []}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayBackground,
    backgroundColor: colors.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    backgroundColor: colors.grayBackground,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.fontMainColor,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addButton: {
    backgroundColor: colors.btncolor,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  addButtonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  summaryContainer: {
    padding: 16,
    backgroundColor: colors.grayBackground,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 16,
    color: colors.fontSecondColor,
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.fontMainColor,
    marginBottom: 4,
  },
  participantsText: {
    fontSize: 14,
    color: colors.fontSecondColor,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayBackground,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginHorizontal: 8,
  },
  activeTab: {
    borderBottomColor: colors.btncolor,
    backgroundColor: colors.grayBackground,
    borderRadius: 8,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.fontSecondColor,
  },
  activeTabText: {
    color: colors.btncolor,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
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
  removeButton: {
    padding: 8,
  },
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
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
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
  submitButton: {
    padding: 8,
  },
  submitButtonText: {
    color: colors.Zypsii_color,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.fontMainColor,
    textAlign: 'center',
    flex: 1,
  },
  modalBody: {
    flex: 1,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLinesColor,
  },
  amountLabel: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.fontMainColor,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: colors.fontMainColor,
  },
  descriptionInput: {
    padding: 16,
    fontSize: 16,
    color: colors.fontMainColor,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLinesColor,
  },
  paidByContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLinesColor,
  },
  sectionLabel: {
    fontSize: 14,
    color: colors.fontSecondColor,
    marginBottom: 8,
  },
  paidBySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  paidByText: {
    fontSize: 16,
    color: colors.fontMainColor,
  },
  splitOptionsContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLinesColor,
  },
  splitTypeButtons: {
    flexDirection: 'row',
    backgroundColor: colors.grayBackground,
    borderRadius: 8,
    padding: 4,
  },
  splitTypeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  splitTypeButtonActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  splitTypeText: {
    fontSize: 14,
    color: colors.fontSecondColor,
  },
  splitTypeTextActive: {
    color: colors.fontMainColor,
    fontWeight: '600',
  },
  splitListContainer: {
    padding: 16,
  },
  splitListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  splitListTitle: {
    fontSize: 14,
    color: colors.fontSecondColor,
  },
  splitEquallyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  splitEquallyText: {
    marginLeft: 4,
    color: colors.Zypsii_color,
    fontWeight: '600',
  },
  splitListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  participantInfo: {
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
    fontSize: 16,
    fontWeight: '600',
  },
  participantName: {
    fontSize: 16,
    color: colors.fontMainColor,
  },
  splitAmountInput: {
    width: 80,
    textAlign: 'right',
    fontSize: 16,
    color: colors.fontMainColor,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.grayLinesColor,
    borderRadius: 8,
  },
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: colors.grayBackground,
  },
  inviteButton: {
    backgroundColor: colors.btncolor,
  },
  cancelButtonText: {
    color: colors.fontMainColor,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  inviteButtonText: {
    color: colors.white,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.btncolor,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
  searchWrapper: {
    paddingHorizontal: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.grayBackground,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: colors.grayLinesColor,
  },
  searchIcon: {
    marginRight: 12,
    color: colors.fontSecondColor,
  },
  searchInputField: {
    flex: 1,
    fontSize: 16,
    color: colors.fontMainColor,
    height: '100%',
    paddingVertical: 8,
  },
  clearSearchButton: {
    padding: 8,
    backgroundColor: colors.grayBackground,
    borderRadius: 12,
  },
  userItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayBackground,
    backgroundColor: colors.white,
  },
  userInfoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.Zypsii_color,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  userAvatarText: {
    color: colors.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
  userDetailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  userNameText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.fontMainColor,
    marginBottom: 4,
  },
  userEmailText: {
    fontSize: 14,
    color: colors.fontSecondColor,
  },
  addIconContainer: {
    padding: 10,
    backgroundColor: colors.grayBackground,
    borderRadius: 12,
  },
  searchResultsContainer: {
    flexGrow: 1,
    paddingTop: 12,
  },
  emptyResultsContainer: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyResultsText: {
    fontSize: 16,
    color: colors.fontSecondColor,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalHeaderWithSearch: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayBackground,
    paddingBottom: 16,
  },
  modalHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  categoryError: {
    marginTop: 8,
    marginBottom: 4,
    color: colors.error,
    fontSize: 12,
    textAlign: 'center',
  },
  paidByError: {
    color: colors.error,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
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
  categoryContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLinesColor,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.grayBackground,
    minWidth: '30%',
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: colors.Zypsii_color,
  },
  categoryButtonText: {
    color: colors.fontMainColor,
    fontSize: 14,
  },
  categoryButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  step1Container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  bottomButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grayLinesColor,
    backgroundColor: colors.white,
  },
  nextButton: {
    backgroundColor: colors.Zypsii_color,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  headerPlaceholder: {
    width: 70, // Match the width of the submit button
  },
  paidByButton: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLinesColor,
  },
  paidByContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paidByLeft: {
    flex: 1,
  },
  paidByLabel: {
    fontSize: 14,
    color: colors.fontSecondColor,
    marginBottom: 4,
  },
  paidByName: {
    fontSize: 16,
    color: colors.fontMainColor,
    fontWeight: '500',
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
  payerName: {
    fontSize: 16,
    color: colors.fontMainColor,
    marginLeft: 12,
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
  step2Container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  submitButton: {
    backgroundColor: colors.Zypsii_color,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  participantCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  splitAmountInputDisabled: {
    backgroundColor: colors.grayBackground,
    color: colors.fontSecondColor,
  },
});

export default SplitDetail;