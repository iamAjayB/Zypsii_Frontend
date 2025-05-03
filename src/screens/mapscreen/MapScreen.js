// import React, { useState } from "react";
// import { View, StyleSheet, TouchableOpacity, Text, Dimensions, TextInput } from "react-native";
// import MapView, { Marker } from "react-native-maps";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import Geocoder from 'react-native-geocoding';
// import Icon from 'react-native-vector-icons/Ionicons';

// const { width, height } = Dimensions.get("window");

// Geocoder.init("YOUR_GOOGLE_API_KEY");

// function MapScreen() {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { dayId } = route.params;

//   const [region, setRegion] = useState({
//     latitude: 11.1276,
//     longitude: 78.6569,
//     latitudeDelta: 0.0922,
//     longitudeDelta: 0.0421,
//   });

//   const [searchText, setSearchText] = useState("");

//   const handleMapPress = (e) => {
//     const { latitude, longitude } = e.nativeEvent.coordinate;
//     if (latitude && longitude) {
//       setRegion({
//         ...region,
//         latitude,
//         longitude,
//       });
//     }
//   };

//   const handleSearch = () => {
//     if (searchText.trim()) {
//       Geocoder.from(searchText)
//         .then((json) => {
//           const location = json.results[0].geometry.location;
//           const { lat, lng } = location;

//           if (lat && lng) {
//             setRegion({
//               ...region,
//               latitude: lat,
//               longitude: lng,
//               latitudeDelta: 0.0922,
//               longitudeDelta: 0.0421,
//             });
//           } else {
//             console.warn("Invalid location data.");
//           }
//         })
//         .catch((error) => {
//           console.warn("Error with geocoding:", error);
//         });
//     }
//   };

//   const handleDone = () => {
//     if (region.latitude && region.longitude) {
//       navigation.navigate("MakeSchedule", {
//         dayId,
//         latitude: region.latitude,
//         longitude: region.longitude
//       });
//     } else {
//       console.warn("Invalid coordinates. Please select a valid location.");
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.searchContainer}>
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search for a place"
//           value={searchText}
//           onChangeText={setSearchText}
//         />
//         <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
//           <Icon name="search" size={24} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       <MapView
//         style={styles.map}
//         region={region}
//         onPress={handleMapPress}
//       >
//         <Marker coordinate={region} />
//       </MapView>

//       <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
//         <Text style={styles.doneButtonText}>Done</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//     backgroundColor: '#fff',
//     position: 'absolute',
//     top: 20,
//     left: 20,
//     right: 20,
//     zIndex: 1,
//     borderRadius: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   searchInput: {
//     flex: 1,
//     height: 40,
//     paddingHorizontal: 10,
//     fontSize: 16,
//   },
//   searchButton: {
//     backgroundColor: '#A60F93',
//     padding: 10,
//     borderRadius: 5,
//     marginLeft: 10,
//   },
//   map: {
//     width,
//     height: height - 100,
//   },
//   doneButton: {
//     position: 'absolute',
//     bottom: 20,
//     left: 20,
//     right: 20,
//     backgroundColor: '#A60F93',
//     padding: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   doneButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });

// export default MapScreen; 