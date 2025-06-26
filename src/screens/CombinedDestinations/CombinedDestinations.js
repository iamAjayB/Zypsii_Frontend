import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Text
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextDefault } from '../../components';
import { colors, scale } from '../../utils';
import ProductCard from '../../ui/ProductCard/ProductCard';
import { useNavigation, useRoute } from '@react-navigation/native';
import { base_url } from '../../utils/base_url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStatusBar } from '../../utils/useStatusBar';
import { MaterialIcons } from '@expo/vector-icons';
import BottomTab from '../../components/BottomTab/BottomTab';

const { width } = Dimensions.get('window');

const VIEW_TYPES = {
  NEAREST: 'nearest',
  BEST: 'best',
  ALL: 'all'
};

// Categories data
const categories = [
  "Backpacking", "Beach Bars", "Camping", "Diving", "Fishing",
  "Free Diving", "Hiking", "Mountains", "Nature", "Outdoors",
  "Rock Climbing", "Sailing", "Scuba Diving", "Snorkeling", "Surfing",
  "Swimming", "Trekking", "Water Sports", "Wildlife", "Adventure Sports"
];

function CombinedDestinations() {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedView, setSelectedView] = useState(route.params?.viewType || VIEW_TYPES.NEAREST);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    nextPageToken: null,
    hasMore: true
  });

  useStatusBar(colors.btncolor, 'light-content');

  const fetchDestinations = async (viewType, nextPageToken = null) => {
    try {
      setLoading(true);
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) return;

      let url = `${base_url}/schedule/places/getNearest`;
      
      // Add query parameters based on view type
      if (viewType === VIEW_TYPES.BEST) {
        url += '?bestDestination=true';
      } else if (viewType === VIEW_TYPES.NEAREST) {
        url += '?type=nearest';
      }

      if (nextPageToken) {
        url += `&nextPageToken=${nextPageToken}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();
      
      if (Array.isArray(data?.data)) {
        const formattedData = data.data.map(item => ({
          id: item._id || item.name,
          image: item.image,
          name: item.name,
          rating: parseFloat(item.rating) || 0,
          distanceInKilometer: item.distanceInKilometer
        }));

        if (nextPageToken) {
          setDestinations(prev => [...prev, ...formattedData]);
        } else {
          setDestinations(formattedData);
        }

        setPagination({
          nextPageToken: data.nextPageToken || null,
          hasMore: !!data.nextPageToken
        });
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations(selectedView);
  }, [selectedView]);

  const loadMore = () => {
    if (pagination.hasMore && !loading) {
      fetchDestinations(selectedView, pagination.nextPageToken);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialIcons name="arrow-back" size={24} color={colors.fontMainColor} />
      </TouchableOpacity>
      <TextDefault style={styles.headerTitle}>Where to Go</TextDefault>
      <View style={styles.headerRight} />
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <TextDefault textColor={colors.fontMainColor} H5 bold style={styles.categoriesTitle}>
        Categories
      </TextDefault>
      <View style={styles.categoriesWrapper}>
        {categories.map((category, idx) => (
          <View
            key={category}
            style={styles.categoryTag}
          >
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <ProductCard
      styles={styles.itemCardContainer}
      {...item}
      rating={item.rating}
      distance={item.distanceInKilometer ? parseFloat(item.distanceInKilometer).toFixed(1) : null}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderCategories()}
      {loading && !pagination.nextPageToken ? (
        <View style={styles.initialLoaderContainer}>
          <ActivityIndicator size="large" color={colors.btncolor} />
        </View>
      ) : (
        <FlatList
          data={destinations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          onEndReached={loadMore}
          onEndReachedThreshold={0.2}
          ListFooterComponent={() => (
            loading && pagination.nextPageToken ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.btncolor} />
              </View>
            ) : null
          )}
        />
      )}
      <BottomTab screen="WhereToGo" />
    </SafeAreaView>
  );
}

const CARD_GAP = scale(10);
const CARD_HORIZONTAL_PADDING = scale(10);
const CARD_WIDTH = (width - CARD_HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: scale(8),
    backgroundColor: colors.grayBackground,
    borderRadius: scale(8),
  },
  headerTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: colors.fontMainColor,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: scale(16),
  },
  headerRight: {
    width: scale(40),
  },
  categoriesContainer: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(16),
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },
  categoriesTitle: {
    marginBottom: scale(12),
  },
  categoriesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    margin: 4,
  },
  categoryText: {
    color: '#333',
    fontSize: 15,
  },
  listContainer: {
    paddingTop: scale(10),
    paddingBottom: scale(80), // Add padding for bottom tab
    paddingHorizontal: CARD_HORIZONTAL_PADDING,
  },
  itemCardContainer: {
    width: CARD_WIDTH,
    marginBottom: CARD_GAP,
    marginRight: CARD_GAP,
  },
  loaderContainer: {
    padding: scale(20),
    alignItems: 'center'
  },
  initialLoaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default CombinedDestinations; 