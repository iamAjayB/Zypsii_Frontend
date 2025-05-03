import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils';
import { useNavigation, useRoute } from '@react-navigation/native';

function SplitDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const { splitId } = route.params;

  // State for tabs
  const [activeTab, setActiveTab] = useState('participants');

  // State for participants and expenses
  const [participants, setParticipants] = useState([
    { id: '1', name: 'John', email: 'john@example.com', phone: '1234567890' },
    { id: '2', name: 'Sarah', email: 'sarah@example.com', phone: '9876543210' },
  ]);
  const [expenses] = useState([
    {
      id: '1',
      description: 'Dinner at Restaurant',
      amount: 1200,
      paidBy: 'John',
      date: '2024-04-15',
    },
    {
      id: '2',
      description: 'Movie Tickets',
      amount: 800,
      paidBy: 'Sarah',
      date: '2024-04-15',
    },
    {
      id: '3',
      description: 'Transportation',
      amount: 500,
      paidBy: 'John',
      date: '2024-04-15',
    },
  ]);

  // State for invite modal
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');

  const renderExpenseItem = ({ item }) => (
    <View style={styles.expenseItem}>
      <View style={styles.expenseInfo}>
        <Text style={styles.expenseDescription}>{item.description}</Text>
        <Text style={styles.expenseDate}>{item.date}</Text>
      </View>
      <View style={styles.expenseAmount}>
        <Text style={styles.amountText}>₹{item.amount}</Text>
        <Text style={styles.paidByText}>Paid by {item.paidBy}</Text>
      </View>
    </View>
  );

  const renderParticipantItem = ({ item }) => (
    <View style={styles.participantItem}>
      <View style={styles.participantInfo}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
        </View>
        <View style={styles.participantDetails}>
          <Text style={styles.participantName}>{item.name}</Text>
          <Text style={styles.participantContact}>{item.email || item.phone}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveParticipant(item.id)}
      >
        <Ionicons name="close-circle" size={24} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  const handleAddExpense = () => {
    navigation.navigate('ExpenseCalculator', { splitId });
  };

  const handleInviteFriend = () => {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      Alert.alert('Error', 'Please enter both name and email');
      return;
    }

    const newParticipant = {
      id: Date.now().toString(),
      name: inviteName.trim(),
      email: inviteEmail.trim(),
    };

    setParticipants([...participants, newParticipant]);
    setInviteName('');
    setInviteEmail('');
    setIsInviteModalVisible(false);
    Alert.alert('Success', `${newParticipant.name} has been invited to the split`);
  };

  const handleRemoveParticipant = (participantId) => {
    Alert.alert(
      'Remove Participant',
      'Are you sure you want to remove this participant?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setParticipants(participants.filter(p => p.id !== participantId));
          },
        },
      ]
    );
  };

  const calculateBalances = () => {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const perPersonShare = totalExpenses / participants.length;
    
    return participants.map(participant => {
      const paidAmount = expenses
        .filter(expense => expense.paidBy === participant.name)
        .reduce((sum, expense) => sum + expense.amount, 0);
      
      return {
        name: participant.name,
        balance: paidAmount - perPersonShare,
      };
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'expenses':
        return (
          <View style={styles.tabContent}>
            <FlatList
              data={expenses}
              renderItem={renderExpenseItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No expenses added yet</Text>
                </View>
              }
            />
          </View>
        );
      case 'participants':
        return (
          <View style={styles.tabContent}>
            <FlatList
              data={participants}
              renderItem={renderParticipantItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
            />
          </View>
        );
      default:
        return null;
    }
  };

  const handleMapPress = () => {
    navigation.navigate('TripMap', {
      tripDetails: {
        title: 'Trip Details',
        days: [
          {
            day: 1,
            location: 'Bangalore to Mysore',
            distance: '143 km',
            attractions: ['Mysore Palace', 'St. Philomena\'s Church', 'Brindavan Gardens']
          },
          {
            day: 2,
            location: 'Mysore to Ooty',
            distance: '124 km',
            attractions: ['Ooty Lake', 'Botanical Garden', 'Rose Garden']
          },
          {
            day: 3,
            location: 'Ooty to Coonoor',
            distance: 'Local',
            attractions: ['Sim\'s Park', 'Dolphin\'s Nose', 'Lamb\'s Rock']
          },
          {
            day: 4,
            location: 'Coonoor to Kodaikanal',
            distance: '231 km',
            attractions: ['Kodaikanal Lake', 'Bryant Park', 'Coaker\'s Walk']
          },
          {
            day: 5,
            location: 'Return to Bangalore',
            distance: '463 km',
            attractions: []
          }
        ],
        totalDays: '4 Night 5 Days',
        startPrice: 'Rs.12850',
        title: 'Mysore Ooty Kodaikanal'
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.fontMainColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Split Details</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.mapButton}
            onPress={handleMapPress}
          >
            <Ionicons name="map-outline" size={24} color={colors.fontMainColor} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsInviteModalVisible(true)}
          >
            <Ionicons name="person-add" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Total Expenses</Text>
        <Text style={styles.totalAmount}>
          ₹{expenses.reduce((sum, expense) => sum + expense.amount, 0)}
        </Text>
        <Text style={styles.participantsText}>{participants.length} participants</Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'participants' && styles.activeTab]}
          onPress={() => setActiveTab('participants')}
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
          onPress={() => setActiveTab('expenses')}
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

      {renderTabContent()}

      {activeTab === 'expenses' && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={handleAddExpense}
        >
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      )}

      <Modal
        visible={isInviteModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsInviteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Invite Friend</Text>
            <TextInput
              style={styles.input}
              placeholder="Friend's Name"
              value={inviteName}
              onChangeText={setInviteName}
            />
            <TextInput
              style={styles.input}
              placeholder="Friend's Email"
              value={inviteEmail}
              onChangeText={setInviteEmail}
              keyboardType="email-address"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsInviteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.inviteButton]}
                onPress={handleInviteFriend}
              >
                <Text style={styles.inviteButtonText}>Invite</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.fontMainColor,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapButton: {
    padding: 8,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: colors.btncolor,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.grayBackground,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.grayBackground,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.fontMainColor,
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 12,
    color: colors.fontSecondColor,
  },
  expenseAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.fontMainColor,
    marginBottom: 4,
  },
  paidByText: {
    fontSize: 12,
    color: colors.fontSecondColor,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.fontMainColor,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.grayBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.fontSecondColor,
    marginBottom: 16,
  },
});

export default SplitDetail; 