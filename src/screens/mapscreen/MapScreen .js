import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, TextInput, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { base_url } from '../../utils/base_url';
import colors from "../../components/Text/TextDefault/styles";

const { width, height } = Dimensions.get("window");

function MapScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { dayId, type, initialLocation } = route.params || {};

  const [region, setRegion] = useState({
    latitude: initialLocation?.latitude || 11.1276,
    longitude: initialLocation?.longitude || 78.6569,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlaceName, setSelectedPlaceName] = useState(initialLocation?.placeName || "");

  useEffect(() => {
    // If initialLocation changes, update region
    if (initialLocation && initialLocation.latitude && initialLocation.longitude) {
      setRegion(region => ({
        ...region,
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
      }));
    }
  }, [initialLocation]);

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    if (latitude && longitude) {
      setRegion({
        ...region,
        latitude,
        longitude,
      });
      setSelectedPlaceName(''); // Clear place name if user taps map
    }
  };

  const handleSearch = async () => {
    if (searchText.trim()) {
      try {
        setLoading(true);
        const accessToken = await AsyncStorage.getItem('accessToken');
        const url = `${base_url}/schedule/places/getNearest?searchPlaceName=${(searchText)}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log(result)

        if (result.data && result.data.length > 0) {
          const firstResult = result.data[0];
          if (firstResult.location && firstResult.location.lat && firstResult.location.lng) {
            setRegion({
              ...region,
              latitude: firstResult.location.lat,
              longitude: firstResult.location.lng,
            });
            setSearchResults(result.data);
            setSelectedPlaceName(firstResult.name || searchText);
          }
        } else {
          Alert.alert('No Results', 'No places found for your search.');
        }
      } catch (error) {
        console.error("Error searching places:", error);
        Alert.alert('Error', 'Failed to search places. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDone = () => {
     if (region.latitude && region.longitude) {
      let placeName = selectedPlaceName || 'Selected Location';
      if (!selectedPlaceName) {
        if (searchResults.length > 0 && searchResults[0].name) {
          placeName = searchResults[0].name;
        } else if (searchText) {
          placeName = searchText;
        }
      }
      navigation.navigate("MakeSchedule", {
        dayId,
        latitude: region.latitude,
        longitude: region.longitude,
        type: type,
        placeName: placeName
      });
    } else {
      Alert.alert('Error', 'Please select a valid location.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a place (e.g., kovalam kanyakumari)"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity 
          style={[styles.searchButton, loading && styles.searchButtonDisabled]} 
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>
            {loading ? 'Searching...' : 'Search'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Show selected place name above the map */}
      {selectedPlaceName ? (
        <View style={{padding: 8, backgroundColor: '#fff', alignSelf: 'stretch', alignItems: 'center'}}>
          <Text style={{fontWeight: 'bold', color: '#A60F93'}}>Selected: {selectedPlaceName}</Text>
        </View>
      ) : null}

      <MapView
        style={styles.map}
        region={region}
        onPress={handleMapPress}
      >
        <Marker coordinate={region} />
      </MapView>

      <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
        <Text style={styles.doneButtonText }>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  searchContainer: {
    width: '100%',
    padding: 10,
    backgroundColor: '#fff',
    position: 'absolute',
    top: 0,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  map: {
    width,
    height: height,
  },
  doneButton: {
    backgroundColor: '#A60F93',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    width: '90%',
    alignItems: "center",
    justifyContent: "center",
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchInput: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    borderColor: "#ccc",
    borderWidth: 1,
    backgroundColor: "#fff",
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#A60F93',
    padding: 10,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#ccc',
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MapScreen; 