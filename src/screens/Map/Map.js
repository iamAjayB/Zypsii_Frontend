import React, { useState, useEffect } from 'react';
import { View, Text,FlatList, StyleSheet, Dimensions, ScrollView, Image } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { BackHeader, BottomTab } from "../../components";
import { alignment, colors } from "../../utils";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { TextDefault } from '../../components';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DiscoverByNearest from '../../components/DiscoverByNearest/DiscoverByNearest';
import { base_url } from '../../utils/base_url';
//const baseUrl = 'https://admin.zypsii.com';
const Map = ({ route }) => {
  const navigation = useNavigation();
  const backPressed = () => {
    navigation.goBack(); // Navigate to the previous screen when the back arrow is pressed
  };
  const [discoverbynearest, setDiscoverbyNearest] = useState([]);

    // Fetch data from an open-source API (JSONPlaceholder API for demonstration)
    useEffect(() => {
      const fetchDiscoverbyNearest = async () => {
        try {
          const response = await fetch(`${base_url}/schedule/places/getNearest`);
          const data = await response.json();
  
          // Log to verify the data structure
         // console.log(data);
  
          const formattedData = data.slice(0, 100).map(item => ({
            id: item.id,
            image: item.image,
            title: item.name,
            subtitle: item.subtitle,
          }));
  
          //console.log(formattedData); // Check the formatted data with image URLs
  
          setDiscoverbyNearest(formattedData);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
  
      fetchDiscoverbyNearest();
    }, []);
  // Destructure the route params and set default values if they are undefined
  const { fromLocation = 'Unknown', toLocation = 'Unknown' } = route.params || {};

  // Route coordinates dynamically adjusted for "from" and "to" locations
  const routeCoordinates = [
    { latitude: 13.0827, longitude: 80.2707 }, // Chennai (default starting point)
    { latitude: 12.9716, longitude: 77.5946 }, // Bangalore (mid-point)
    { latitude: 12.2958, longitude: 76.6394 }, // Mysore (default destination)
  ];

  return (
    <View style={styles.container}>
      <View style={styles.protractorShape} />
      <View style={styles.backgroundCurvedContainer} />

      {/* Back Header */}
      <BackHeader backPressed={backPressed} /> 

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContainer}>
        {/* Title */}
        <Text style={styles.title}>Trip Starts</Text>

        {/* From-To Section */}
        <View style={styles.fromToContainer}>
          <View style={styles.locationInfo}>
            <MaterialCommunityIcons name="map-marker-outline" size={20} color={colors.darkGray} />
            <Text style={styles.locationText}>
            {fromLocation.length > 7 ? fromLocation.slice(0, 15) + '...' : fromLocation}
          </Text>
          </View>
          <MaterialCommunityIcons name="arrow-right" size={20} color={colors.darkGray} style={styles.arrowIcon} />
          <View style={styles.locationInfo}>
            <MaterialCommunityIcons name="map-marker-outline" size={20} color={colors.darkGray} />
            <Text style={styles.locationText}>
        {toLocation && toLocation.length > 7
          ? toLocation.slice(0, 15) + '...'
          : toLocation}
      </Text>
          </View>
        </View>

        {/* Map View */}
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: routeCoordinates[0].latitude, // Initial latitude
            longitude: routeCoordinates[0].longitude, // Initial longitude
            latitudeDelta: 4.5,
            longitudeDelta: 4.5,
          }}
        >
          {/* Markers */}
          <Marker
            coordinate={routeCoordinates[0]}
            title="Chennai"
            description="Starting Point"
          />
          <Marker
            coordinate={routeCoordinates[1]}
            title="Bangalore"
            description="Stopover"
          />
          <Marker
            coordinate={routeCoordinates[2]}
            title="Mysore"
            description="Destination"
          /> 

          {/* Route */}
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#007AFF"
            strokeWidth={4}
          />
        </MapView>

        <Text style={styles.explore}>Explore Travel</Text>

        <View style={styles.discoverRow}>
          <TextDefault style={styles.discoverText}>Discover by Nearest</TextDefault>
          <TouchableOpacity onPress={() => navigation.navigate('DiscoverPlace')}>
            <TextDefault style={styles.viewAllText}>View All</TextDefault>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => item.id}
          data={discoverbynearest}
          renderItem={({ item, index }) => (
            <DiscoverByNearest styles={styles.itemCardContainer} {...item} />
          )}
        />

      </ScrollView>

      {/* Bottom Tab */}
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
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 80,
    zIndex: 2,
    top: 90,
  },
  fromToContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 16,
    fontWeight: "bold",
    ...alignment.MLmedium,
    color: colors.darkGray,
  },
  arrowIcon: {
    marginHorizontal: 5,
  },
  title: {
    textAlign: "center",
    marginVertical: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: colors.fontMainColor,
  },
  map: {
    width: Dimensions.get("window").width * 0.9,
    alignSelf: "center",
    height: Dimensions.get("window").height * 0.4,
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
 
  explore: {
    ...alignment.Psmall,
    fontWeight: "bold",
    alignSelf: "center",
    fontSize: 16,
  },
});

export default Map;
