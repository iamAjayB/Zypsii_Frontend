import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../utils';
import { useNavigation } from '@react-navigation/native';
import { BottomTab } from '../../components';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { base_url } from '../../utils/base_url';
import SplitHeader from '../../components/Split/SplitHeader';
import SplitCard from '../../components/Split/SplitCard';
import EmptySplitList from '../../components/Split/EmptySplitList';

function SplitDashboard() {
  const navigation = useNavigation();
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSplits();
  }, []);

  const fetchSplits = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await axios.get(`${base_url}/api/splits`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      setSplits(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching splits:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch splits');
      setLoading(false);
    }
  };

  const handleSplitPress = (splitId) => {
    navigation.navigate('SplitDetail', { splitId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <SplitHeader onAddPress={() => navigation.navigate('CreateSplit')} />

      <FlatList
        data={splits}
        renderItem={({ item }) => (
          <SplitCard 
            item={item} 
            onPress={() => handleSplitPress(item._id)} 
          />
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <EmptySplitList onCreatePress={() => navigation.navigate('CreateSplit')} />
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
  listContainer: {
    padding: 16,
  },
});

export default SplitDashboard; 