import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils';
import { useNavigation } from '@react-navigation/native';
import { BottomTab } from '../../components';

// Hardcoded split data
const SPLIT_DATA = [
  {
    id: '1',
    title: 'Weekend Trip',
    totalAmount: 2500,
    participants: 4,
    date: '2024-04-20',
    status: 'active',
  },
  {
    id: '2',
    title: 'Dinner Party',
    totalAmount: 1200,
    participants: 3,
    date: '2024-04-15',
    status: 'settled',
  },
  {
    id: '3',
    title: 'Movie Night',
    totalAmount: 800,
    participants: 2,
    date: '2024-04-10',
    status: 'active',
  },
];

function SplitDashboard() {
  const navigation = useNavigation();
  const [splits, setSplits] = useState(SPLIT_DATA);

  const renderSplitItem = ({ item }) => (
    <TouchableOpacity
      style={styles.splitCard}
      onPress={() => navigation.navigate('SplitDetail', { splitId: item.id })}
    >
      <View style={styles.splitHeader}>
        <Text style={styles.splitTitle}>{item.title}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'active' ? colors.greenColor : colors.grayLinesColor }
        ]}>
          <Text style={styles.statusText}>
            {item.status === 'active' ? 'Active' : 'Settled'}
          </Text>
        </View>
      </View>
      
      <View style={styles.splitDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="people-outline" size={16} color={colors.fontThirdColor} />
          <Text style={styles.detailText}>{item.participants} people</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="cash-outline" size={16} color={colors.fontThirdColor} />
          <Text style={styles.detailText}>₹{item.totalAmount}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={colors.fontThirdColor} />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Split Expenses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('ExpenseCalculator')}
        >
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={splits}
        renderItem={renderSplitItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No splits created yet</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('ExpenseCalculator')}
            >
              <Text style={styles.createButtonText}>Create New Split</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <BottomTab screen="SPLIT" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.themeBackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLinesColor,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.fontMainColor,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.Zypsii_color,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  splitCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  splitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  splitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.fontMainColor,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '500',
  },
  splitDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 4,
    color: colors.fontThirdColor,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.fontThirdColor,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: colors.Zypsii_color,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SplitDashboard; 