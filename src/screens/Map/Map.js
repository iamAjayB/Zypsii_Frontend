import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, ScrollView, Image, Share, Modal } from "react-native";
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
import { useToast } from '../../context/ToastContext';

const { width, height } = Dimensions.get('window');

const Map = ({ route }) => {
  const navigation = useNavigation();
  const { showToast } = useToast();
  
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
  const [isFullMapVisible, setIsFullMapVisible] = useState(false);
  const mapRef = useRef(null);
  const fullMapRef = useRef(null);
  const { tripId } = route.params || {};

  // Add sample locations for 4 days
  const [dayLocations, setDayLocations] = useState([
    {
      id: 'day1',
      name: 'Kanyakumari',
      location: { lat: 8.0883, lng: 77.5385 }, // Kanyakumari coordinates
      address: 'Kanyakumari, Tamil Nadu'
    },
    {
      id: 'day2',
      name: 'Thiruvananthapuram',
      location: { lat: 8.5241, lng: 76.9366 }, // Thiruvananthapuram coordinates
      address: 'Thiruvananthapuram, Kerala'
    },
    {
      id: 'day3',
      name: 'Bangalore',
      location: { lat: 12.9716, lng: 77.5946 }, // Bangalore coordinates
      address: 'Bangalore, Karnataka'
    },
    {
      id: 'day4',
      name: 'Goa',
      location: { lat: 15.4989, lng: 73.8278 }, // Goa coordinates
      address: 'Goa'
    }
  ]);

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
        `${base_url}/schedule/listing/scheduleDescription/${tripId}/${currentUserId}?offset=0&limit=20`,
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

  // Calculate initial region based on selected locations
  const getInitialRegion = () => {
    const locations = dayLocations;
    if (locations.length === 0) {
      return {
        latitude: 12.9716, // Center on Bangalore
        longitude: 77.5946,
        latitudeDelta: 8, // Increased to show all locations
        longitudeDelta: 8,
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

        console.log('Fetching discover data with token:', accessToken.substring(0, 10) + '...'); // Debug log
        const url = `${base_url}/schedule/places/getNearest?bestDestination=true`;
        console.log('API URL:', url); // Debug log

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('API Response status:', response.status); // Debug log

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log('Raw API Response:', JSON.stringify(data, null, 2)); // Debug log
        
        if (!data) {
          console.error('No data received from API');
          setDiscoverbyNearest([]);
          return;
        }

        if (!data.data || !Array.isArray(data.data)) {
          console.error('Invalid data format received:', data);
          setDiscoverbyNearest([]);
          return;
        }

        const formattedData = data.data.map(item => {
          if (!item) {
            console.warn('Received null item in data array');
            return null;
          }

          const formattedItem = {
            id: item._id || item.id,
            image: item.image ? (item.image.startsWith('http') ? item.image : `${base_url}/${item.image.replace(/^\/+/, '')}`) : null,
            title: item.name || item.title || 'Unknown Place',
            subtitle: item.address || item.subtitle || 'No address available',
            rating: parseFloat(item.rating) || 0,
            distance: parseFloat(item.distanceInKilometer) || 0
          };

          console.log('Formatted item:', formattedItem); // Debug log
          return formattedItem;
        }).filter(item => item !== null); // Remove any null items
        
        console.log('Final formatted data:', formattedData); // Debug log
        
        if (formattedData.length === 0) {
          console.warn('No valid items found after formatting');
        }

        setDiscoverbyNearest(formattedData);
      } catch (error) {
        console.error('Error in fetchDiscoverbyNearest:', error);
        setDiscoverbyNearest([]);
      }
    };

    fetchDiscoverbyNearest();
  }, []);

  // Add a debug effect to monitor discoverbynearest state
  useEffect(() => {
    console.log('Current discoverbynearest state:', discoverbynearest);
  }, [discoverbynearest]);

  // Update the FlatList to handle empty states better
  const renderDiscoverList = () => {
    if (!discoverbynearest || discoverbynearest.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="map-search-outline" size={48} color={colors.btncolor} />
          <Text style={styles.emptyText}>No places to discover</Text>
          <Text style={styles.emptySubText}>Check back later for recommendations</Text>
        </View>
      );
    }

    return (
      <FlatList
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id || item._id}
        data={discoverbynearest}
        renderItem={({ item }) => {
         // console.log('Rendering discover item:', item); // Debug log
          if (!item) {
           // console.warn('Received null or undefined item in FlatList');
            return null;
          }
          return (
            <View style={styles.discoverItemWrapper}>
              <DiscoverByNearest
                id={item.id || item._id}
                image={item.image}
                title={item.title || item.name || 'Unknown Place'}
                subtitle={item.subtitle || item.address || 'No address available'}
                rating={item.rating || 0}
                distance={item.distance || item.distanceInKilometer || 0}
              />
            </View>
          );
        }}
        style={styles.discoverList}
        contentContainerStyle={styles.discoverListContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="map-search-outline" size={48} color={colors.btncolor} />
            <Text style={styles.emptyText}>No places to discover</Text>
            <Text style={styles.emptySubText}>Check back later for recommendations</Text>
          </View>
        )}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          console.log('Reached end of discover list');
        }}
      />
    );
  };

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

  const handleFullMapBack = () => {
    setIsFullMapVisible(false);
  };

  const handleFullMapZoomIn = () => {
    if (fullMapRef.current) {
      fullMapRef.current.getCamera().then((camera) => {
        const newZoom = camera.zoom + 1;
        fullMapRef.current.animateCamera({
          ...camera,
          zoom: newZoom
        }, { duration: 300 });
      });
    }
  };

  const handleFullMapZoomOut = () => {
    if (fullMapRef.current) {
      fullMapRef.current.getCamera().then((camera) => {
        const newZoom = Math.max(1, camera.zoom - 1);
        fullMapRef.current.animateCamera({
          ...camera,
          zoom: newZoom
        }, { duration: 300 });
      });
    }
  };

  const handleExportLocations = async () => {
    if (selectedPlaces.length === 0) {
      showToast('Please select at least one location to export', 'error');
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
      showToast('Failed to export locations', 'error');
    }
  };

  const renderMapMarkers = () => {
    return dayLocations.map((location, index) => (
      <Marker
        key={location.id}
        coordinate={{
          latitude: location.location.lat,
          longitude: location.location.lng
        }}
        title={location.name}
        description={location.address}
      >
        <View style={styles.customMarker}>
          <View style={[styles.markerInner, { backgroundColor: colors.btncolor }]}>
            <Text style={styles.markerText}>{index + 1}</Text>
          </View>
        </View>
      </Marker>
    ));
  };

  const renderPolyline = () => {
    if (dayLocations.length > 1) {
      return (
        <Polyline
          coordinates={dayLocations.map(loc => ({
            latitude: loc.location.lat,
            longitude: loc.location.lng
          }))}
          strokeColor={colors.btncolor}
          strokeWidth={3}
        />
      );
    }
    return null;
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

      <View style={styles.mainContent}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }} // Add padding to account for bottom tab
        >
          {/* Enhanced Route Display */}
          {dayLocations.length > 0 && (
            <View style={styles.routeCard}>
              <View style={styles.routeHeader}>
                <MaterialCommunityIcons name="navigation" size={20} color={colors.btncolor} />
                <Text style={[styles.routeTitle, { color: colors.btncolor }]}>South India Route</Text>
              </View>
              <View style={styles.fromToContainer}>
                <View style={styles.locationInfo}>
                  <View style={[styles.startMarker, { backgroundColor: colors.btncolor }]}>
                    <MaterialCommunityIcons name="map-marker" size={16} color={colors.white} />
                  </View>
                  <Text style={styles.locationText} numberOfLines={1}>
                    {dayLocations[0].name}
                  </Text>
                </View>
                <View style={styles.routeLine}>
                  <View style={[styles.dashedLine, { backgroundColor: colors.btncolor }]} />
                  <MaterialCommunityIcons name="arrow-right" size={16} color={colors.btncolor} />
                </View>
                <View style={styles.locationInfo}>
                  <View style={[styles.endMarker, { backgroundColor: colors.btncolor }]}>
                    <MaterialCommunityIcons name="flag" size={16} color={colors.white} />
                  </View>
                  <Text style={styles.locationText} numberOfLines={1}>
                    {dayLocations[dayLocations.length - 1].name}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Enhanced Map Container */}
          <View style={styles.mapCard}>
            <View style={styles.mapHeader}>
              <Text style={styles.mapTitle}>Interactive Map</Text>
              <TouchableOpacity 
                style={styles.fullMapButton}
                onPress={() => setIsFullMapVisible(true)}
              >
                <MaterialCommunityIcons name="fullscreen" size={18} color={colors.btncolor} />
                <Text style={styles.fullMapText}>Full View</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={getInitialRegion()}
                showsUserLocation={true}
                showsMyLocationButton={false}
                showsCompass={false}
                toolbarEnabled={false}
              >
                {renderMapMarkers()}
                {renderPolyline()}
              </MapView>

              <View style={styles.zoomControls}>
                <TouchableOpacity 
                  style={styles.zoomButton}
                  onPress={handleZoomIn}
                >
                  <MaterialCommunityIcons name="plus" size={20} color={colors.white} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.zoomButton, { marginTop: 8 }]}
                  onPress={handleZoomOut}
                >
                  <MaterialCommunityIcons name="minus" size={20} color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Enhanced Discover Section */}
          <View style={styles.discoverSection}>
            <View style={styles.discoverRow}>
              <View style={styles.discoverHeaderLeft}>
                <MaterialCommunityIcons name="compass-outline" size={24} color={colors.btncolor} />
                <TextDefault style={styles.discoverText}>Discover Nearby</TextDefault>
              </View>
              <TouchableOpacity 
                onPress={() => navigation.navigate('DiscoverPlace')}
                style={styles.viewAllButton}
              >
                <TextDefault style={styles.viewAllText}>View All</TextDefault>
                <MaterialCommunityIcons name="arrow-right" size={16} color={colors.btncolor} />
              </TouchableOpacity>
            </View>
            {renderDiscoverList()}
          </View>
        </ScrollView>
      </View>

      {/* Full Map Modal */}
      <Modal
        visible={isFullMapVisible}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => setIsFullMapVisible(false)}
      >
        <View style={styles.fullMapContainer}>
          <View style={styles.fullMapHeader}>
            {/* <TouchableOpacity 
              style={styles.fullMapBackButton}
              onPress={() => setIsFullMapVisible(false)}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
            </TouchableOpacity> */}
            <Text style={styles.fullMapTitle}>Full Map View</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <MapView
            ref={fullMapRef}
            style={styles.fullMap}
            initialRegion={getInitialRegion()}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
          >
            {renderMapMarkers()}
            {renderPolyline()}
          </MapView>

          <View style={styles.fullMapZoomControls}>
            {/* <TouchableOpacity 
              style={styles.fullMapZoomButton}
              onPress={handleFullMapZoomIn}
            >
              <MaterialCommunityIcons name="plus" size={24} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.fullMapZoomButton, { marginTop: 10 }]}
              onPress={handleFullMapZoomOut}
            >
              <MaterialCommunityIcons name="minus" size={24} color={colors.white} />
            </TouchableOpacity> */}
          </View>
        </View>
      </Modal>

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
  },
  
  // Enhanced Route Card
  routeCard: {
    backgroundColor: colors.white,
    marginHorizontal: 15,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.fontMainColor,
    marginLeft: 8,
  },
  fromToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  startMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.btncolor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.btncolor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
    color: colors.fontMainColor,
    flex: 1,
  },
  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  dashedLine: {
    width: 30,
    height: 2,
    backgroundColor: colors.btncolor,
    marginRight: 8,
    opacity: 0.5,
  },

  // Enhanced Map Card
  mapCard: {
    backgroundColor: colors.white,
    marginHorizontal: 15,
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.fontMainColor,
  },
  fullMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.btncolor,
  },
  fullMapText: {
    color: colors.btncolor,
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 12,
  },
  mapContainer: {
    position: 'relative',
    width: '100%',
    height: width * 0.6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  customMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  markerInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.btncolor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  zoomControls: {
    position: 'absolute',
    right: 12,
    bottom: 12,
  },
  zoomButton: {
    width: 36,
    height: 36,
    backgroundColor: colors.btncolor,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  // Enhanced Discover Section
  discoverSection: {
    backgroundColor: colors.white,
    marginHorizontal: 15,
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  discoverRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  discoverHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discoverText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.fontMainColor,
    marginLeft: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.btncolor,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.btncolor,
    fontWeight: "600",
    marginRight: 4,
  },
  discoverList: {
    width: '100%',
  },
  discoverListContent: {
    paddingVertical: 8,
  },
  discoverItemWrapper: {
    marginRight: 12,
    width: 180,
  },

  // Enhanced Empty State
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    marginVertical: 16,
  },
  emptyText: {
    color: colors.fontMainColor,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubText: {
    color: colors.darkGray,
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },

  // Full Map Modal Styles
  fullMapContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  fullMapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.btncolor,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 44, // Account for status bar
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fullMapBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  fullMapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  fullMap: {
    flex: 1,
  },
  fullMapZoomControls: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    zIndex: 1000,
  },
  fullMapZoomButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.btncolor,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 1000,
  },

  // Bottom Tab Container
  bottomTabContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 3,
    backgroundColor: colors.white,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  // Additional utility styles
  cardContainer: {
    marginRight: 15,
    width: 180,
    height: 220,
    borderRadius: 12,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
});

export default Map;