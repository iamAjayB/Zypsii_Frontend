import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils';

const SplitHeader = ({ onAddPress }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Split Expenses</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddPress}
      >
        <Ionicons name="add" size={24} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default SplitHeader; 