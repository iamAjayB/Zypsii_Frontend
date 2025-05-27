import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, ScrollView, Image, Share } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { BackHeader, BottomTab } from "../../components";
import { alignment, colors } from "../../utils";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { TextDefault } from '../../components';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DiscoverByNearest from '../../components/DiscoverByNearest/DiscoverByNearest';
import { base_url } from '../../utils/base_url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
//const baseUrl = 'https://admin.zypsii.com';
const Map = ({ route }) => {
  const navigation = useNavigation();
  
  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSearchPress = () => {
    navigation.navigate('SearchPage');
  };

  const handleChatPress = () => {
    navigation.navigate('MessageList');
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  const handleProfilePress = () => {
    navigation.navigate('ProfileDashboard');
  };

  const [discoverbynearest, setDiscoverbyNearest] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const mapRef = useRef(null);
  const { tripId } = route.params || {};

  useEffect(() => {
    fetchScheduleData();
  }, [tripId]);

  const fetchScheduleData = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const user = await AsyncStorage.getItem('user');
      const currentUserId = user ? JSON.parse(user)._id : null;
      
      if (!token || !currentUserId) {
        console.error('Missing token or userId');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${base_url}/schedule/listing/scheduleDescription/${tripId}/${currentUserId}?offset=0&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('Schedule Response:', response.data);
      
      if (response.data && response.data.success && response.data.data) {
        setScheduleData(response.data.data);
        // Set all places as selected by default
        const allPlaces = response.data.data.flatMap(day => day.planDescription || []);
        setSelectedPlaces(allPlaces);
      } else {
        console.log('No schedule data found');
        setScheduleData([]);
        setSelectedPlaces([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching schedule data:', error.response?.data || error.message);
      setScheduleData([]);
      setSelectedPlaces([]);
      setLoading(false);
    }
  };

  // Get all locations from all days
  const getAllLocations = () => {
    return scheduleData.flatMap(day => day.planDescription || []);
  };

  // Update map region when selections change
  useEffect(() => {
    if (mapRef.current && selectedPlaces.length > 0) {
      const locations = selectedPlaces;
      const latitudes = locations.map(loc => loc.location.lat);
      const longitudes = locations.map(loc => loc.location.lng);
      
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);

      mapRef.current.animateToRegion({
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.abs(maxLat - minLat) * 1.5,
        longitudeDelta: Math.abs(maxLng - minLng) * 1.5,
      }, 1000);
    }
  }, [selectedPlaces]);

  const handlePlaceSelect = (place) => {
    setSelectedPlaces(prev => {
      // If place is already selected, remove it
      if (prev.some(p => p._id === place._id)) {
        return prev.filter(p => p._id !== place._id);
      }
      // Add new place to selection
      return [...prev, place];
    });
  };

  const handleSelectAll = () => {
    if (selectedPlaces.length === getAllLocations().length) {
      setSelectedPlaces([]); // Deselect all
    } else {
      setSelectedPlaces(getAllLocations()); // Select all
    }
  };

  // Calculate initial region based on selected locations
  const getInitialRegion = () => {
    const locations = selectedPlaces.length > 0 ? selectedPlaces : getAllLocations();
    if (locations.length === 0) {
      return {
        latitude: 13.0827,
        longitude: 80.2707,
        latitudeDelta: 4.5,
        longitudeDelta: 4.5,
      };
    }

    const latitudes = locations.map(loc => loc.location.lat);
    const longitudes = locations.map(loc => loc.location.lng);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.abs(maxLat - minLat) * 1.5,
      longitudeDelta: Math.abs(maxLng - minLng) * 1.5,
    };
  };

  // Get route coordinates from selected locations
  const getRouteCoordinates = () => {
    const locations = selectedPlaces.length > 0 ? selectedPlaces : getAllLocations();
    return locations.map(loc => ({
      latitude: loc.location.lat,
      longitude: loc.location.lng
    }));
  };

  useEffect(() => {
    const fetchDiscoverbyNearest = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) {
          console.error('No access token found');
          return;
        }

        const response = await fetch(`${base_url}/schedule/places/getNearest`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data && data.data && Array.isArray(data.data)) {
          const formattedData = data.data.slice(0, 100).map(item => ({
            id: item._id || item.id,
            image: item.image,
            title: item.name,
            subtitle: item.address || 'No address',
            rating: parseFloat(item.rating) || 0,
            distance: item.distanceInKilometer ? parseFloat(item.distanceInKilometer).toFixed(1) : null
          }));
          setDiscoverbyNearest(formattedData);
        } else {
          console.log('No discover data found');
          setDiscoverbyNearest([]);
        }
      } catch (error) {
        console.error('Error fetching discover data:', error);
        setDiscoverbyNearest([]);
      }
    };

    fetchDiscoverbyNearest();
  }, []);

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.getCamera().then((camera) => {
        mapRef.current.animateCamera({
          ...camera,
          zoom: camera.zoom + 1
        }, { duration: 300 });
      });
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.getCamera().then((camera) => {
        mapRef.current.animateCamera({
          ...camera,
          zoom: Math.max(1, camera.zoom - 1)
        }, { duration: 300 });
      });
    }
  };

  const handleExportLocations = async () => {
    if (selectedPlaces.length === 0) {
      alert('Please select at least one location to export');
      return;
    }

    const locationsText = selectedPlaces.map((place, index) => {
      return `${index + 1}. ${place.name}\n   Address: ${place.address}\n   Coordinates: ${place.location.lat}, ${place.location.lng}\n`;
    }).join('\n');

    try {
      await Share.share({
        message: `Selected Locations:\n\n${locationsText}`,
        title: 'Trip Locations Export'
      });
    } catch (error) {
      console.error('Error sharing locations:', error);
      alert('Failed to export locations');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.protractorShape} />
      <View style={styles.backgroundCurvedContainer} />

      {/* Back Header */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 999 }}>
        <BackHeader 
          backPressed={handleBackPress}
          onSearchPress={handleSearchPress}
          onChatPress={handleChatPress}
          onNotificationPress={handleNotificationPress}
          onProfilePress={handleProfilePress}
          title=""
          showSearch={true}
          showChat={true}
          showNotification={true}
          showProfile={true}
        />
      </View>

      <View style={[styles.mainContent, { marginTop: 20 }]}>
        <Text style={styles.title}>Trip Locations</Text>

        <View style={styles.placesHeader}>
          <Text style={styles.selectedCount}>
            {selectedPlaces.length} places selected
          </Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={[styles.headerButton, styles.exportButton]}
              onPress={handleExportLocations}
            >
              <MaterialCommunityIcons name="export" size={20} color={colors.white} />
              <Text style={styles.headerButtonText}>Export</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.selectAllButton}
              onPress={handleSelectAll}
            >
              <Text style={styles.selectAllText}>
                {selectedPlaces.length === getAllLocations().length ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal style={styles.placesList}>
          {getAllLocations().map((place) => (
            <TouchableOpacity
              key={place._id}
              style={[
                styles.placeItem,
                selectedPlaces.some(p => p._id === place._id) && styles.selectedPlace
              ]}
              onPress={() => handlePlaceSelect(place)}
            >
              <Text style={[
                styles.placeText,
                selectedPlaces.some(p => p._id === place._id) && styles.selectedPlaceText
              ]}>
                {place.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.fromToContainer}>
          {selectedPlaces.length > 0 && (
            <>
              <View style={styles.locationInfo}>
                <MaterialCommunityIcons name="map-marker-outline" size={20} color={colors.darkGray} />
                <Text style={styles.locationText}>
                  {selectedPlaces[0].name}
                </Text>
              </View>
              <MaterialCommunityIcons name="arrow-right" size={20} color={colors.darkGray} style={styles.arrowIcon} />
              <View style={styles.locationInfo}>
                <MaterialCommunityIcons name="map-marker-outline" size={20} color={colors.darkGray} />
                <Text style={styles.locationText}>
                  {selectedPlaces[selectedPlaces.length - 1].name}
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={getInitialRegion()}
          >
            {selectedPlaces.map((location) => (
              <Marker
                key={location._id}
                coordinate={{
                  latitude: location.location.lat,
                  longitude: location.location.lng
                }}
                title={location.name}
                description={location.address}
              />
            ))}

            {selectedPlaces.length > 1 && (
              <Polyline
                coordinates={selectedPlaces.map(loc => ({
                  latitude: loc.location.lat,
                  longitude: loc.location.lng
                }))}
                strokeColor="#007AFF"
                strokeWidth={4}
              />
            )}
          </MapView>

          <View style={styles.zoomControls}>
            <TouchableOpacity 
              style={styles.zoomButton}
              onPress={handleZoomIn}
            >
              <MaterialCommunityIcons name="plus" size={24} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.zoomButton}
              onPress={handleZoomOut}
            >
              <MaterialCommunityIcons name="minus" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.explore}>Explore Travel</Text>

        <View style={styles.discoverRow}>
          <TextDefault style={styles.discoverText}>Discover by Nearest</TextDefault>
          <TouchableOpacity onPress={() => navigation.navigate('DiscoverPlace')}>
            <TextDefault style={styles.viewAllText}>View All</TextDefault>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => item.id}
        data={discoverbynearest}
        renderItem={({ item, index }) => (
          <DiscoverByNearest styles={styles.itemCardContainer} {...item} />
        )}
        style={styles.discoverList}
      />

      <View style={styles.bottomTabContainer}>
        <BottomTab screen={"WhereToGo"} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  backgroundCurvedContainer: {
    backgroundColor: colors.btncolor,
    height: 200,
    width: "100%",
    position: "absolute",
    top: 0,
    zIndex: 0,
  },
  protractorShape: {
    backgroundColor: colors.white,
    height: 500,
    width: 1000,
    borderTopLeftRadius: 500,
    borderTopRightRadius: 500,
    position: "absolute",
    top: 80,
    alignSelf: "center",
    zIndex: 1,
    overflow: "hidden",
  },
  mainContent: {
    flex: 1,
    paddingTop: 90,
    zIndex: 2,
    paddingBottom: 20,
  },
  fromToContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: colors.white,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginHorizontal: 15,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    color: colors.darkGray,
    flex: 1,
  },
  arrowIcon: {
    marginHorizontal: 10,
  },
  title: {
    textAlign: "center",
    marginVertical: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: colors.fontMainColor,
  },
  mapContainer: {
    position: 'relative',
    width: Dimensions.get("window").width * 0.9,
    alignSelf: 'center',
    height: Dimensions.get("window").height * 0.4,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  zoomControls: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'transparent',
  },
  zoomButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.btncolor,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  explore: {
    ...alignment.Psmall,
    fontWeight: "bold",
    alignSelf: "center",
    fontSize: 16,
  },
  discoverRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginVertical: 10,
    ...alignment.MBmedium,
  },
  discoverText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.fontMainColor,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.btncolor,
    fontWeight: "500",
  },
  discoverList: {
    marginBottom: 100,
    paddingBottom: 20,
  },
  bottomTabContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 3,
    backgroundColor: colors.white,
  },
  placesList: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  placeItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: colors.grayLinesColor,
    borderWidth: 1,
    borderColor: colors.graycolor,
  },
  selectedPlace: {
    backgroundColor: colors.btncolor,
    borderColor: colors.btncolor,
  },
  placeText: {
    color: colors.darkGray,
    fontWeight: 'bold',
  },
  selectedPlaceText: {
    color: colors.white,
  },
  placesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  selectedCount: {
    fontSize: 16,
    color: colors.darkGray,
    fontWeight: 'bold',
  },
  selectAllButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: colors.btncolor,
    borderRadius: 20,
  },
  selectAllText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  exportButton: {
    backgroundColor: colors.btncolor,
  },
  headerButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default Map;
