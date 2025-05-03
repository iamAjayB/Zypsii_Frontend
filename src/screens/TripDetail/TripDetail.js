import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { BackHeader, BottomTab } from '../../components';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // For location icons
import { alignment, colors } from '../../utils'; // Ensure you define appropriate colors in your utils.
import { useNavigation } from '@react-navigation/native';

const TripDetail = ({ route }) => {
  const navigation = useNavigation();
  const { tripData } = route.params;
  const [activeDay, setActiveDay] = useState(1);
  
  const backPressed = () => {
    navigation.goBack();
  };

  // Function to get locations for current day
  const getLocationsForDay = (day) => {
    const locationsPerDay = Math.ceil(tripData.locationDetails.length / parseInt(tripData.numberOfDays));
    const startIndex = (day - 1) * locationsPerDay;
    const endIndex = Math.min(startIndex + locationsPerDay, tripData.locationDetails.length);
    return tripData.locationDetails.slice(startIndex, endIndex);
  };

  // Function to get day title (first location of the day)
  const getDayTitle = (day) => {
    const dayLocations = getLocationsForDay(day);
    if (dayLocations.length > 0) {
      return dayLocations[0].name;
    }
    return `Day ${day}`;
  };

  const renderDayPlan = ({ item, index, arrayLength }) => (
    <View style={styles.dayPlanItem}>
      <View style={styles.iconAndLineContainer}>
        <Icon name="map-marker" size={20} color={colors.black} />
        {index < arrayLength - 1 && <View style={styles.dottedLine} />}
      </View>
      <View style={styles.locationDetails}>
        <Text style={styles.location}>{item.name}</Text>
        <Text style={styles.locationAddress}>{item.address}</Text>
        <Text style={styles.locationDistance}>{item.distanceInKilometer}</Text>
      </View>
    </View>
  );

  // Get all days that have locations
  const daysWithLocations = Array.from({ length: parseInt(tripData.numberOfDays) }, (_, i) => i + 1)
    .filter(day => getLocationsForDay(day).length > 0);

  return (
    <View style={styles.container}>
      <View style={styles.protractorShape} />
      <View style={styles.backgroundCurvedContainer} />
      <View style={styles.maincontainer}>
        <BackHeader backPressed={backPressed} />

        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.topSection}>
            <View style={styles.fromToSection}>
              <View style={styles.locationInfo}>
                <Icon name="map-marker-outline" size={20} color={colors.darkGray} />
                <Text style={styles.locationText}>{getLocationsForDay(activeDay)[0]?.name.slice(0, 5)+'...' || 'Starting Point'}</Text>
              </View>
              <Text style={styles.dottedLineHorizontal}></Text>
              <View style={styles.locationInfo}>
                <Icon name="map-marker-outline" size={20} color={colors.darkGray} />
                <Text style={styles.locationText}>{tripData.locationDetails[tripData.locationDetails.length - 1]?.name.slice(0, 5)+'...' || 'End Point'}</Text>
              </View>
            </View>

            <Image source={{ uri: tripData.imageUrl }} style={styles.image} />
          </View>

          <View style={styles.ridersDateContainer}>
            <Text style={styles.date}>
              <Icon name="calendar-outline" size={20} color={colors.darkGray} /> {tripData.date}
            </Text>
            <Text style={styles.riders}>
              🏍️ Riders: {tripData.riders}
            </Text>
          </View>

          <View style={styles.tripPlanSection}>
            <Text style={styles.sectionTitle}>Trip Detail Plan</Text>
            <Text style={styles.sectionTitleplan}>Locations</Text>

            <View style={styles.daysTabs}>
              {daysWithLocations.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayTab, activeDay === day && styles.activeTab]}
                  onPress={() => setActiveDay(day)}
                >
                  <Text style={[styles.dayTabText, activeDay === day && styles.activeTabText]}>
                    {getDayTitle(day)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.dayPlanList}>
              <FlatList
                data={getLocationsForDay(activeDay)}
                renderItem={({ item, index }) =>
                  renderDayPlan({
                    item,
                    index,
                    arrayLength: getLocationsForDay(activeDay).length,
                  })
                }
                keyExtractor={(item) => item._id}
              />
            </View>
          </View>
        </ScrollView>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('MakeSchedule')}
        >
          <Text style={styles.buttonText}>Change Plan</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, !daysWithLocations.includes(activeDay + 1) && styles.disabledButton]}
          onPress={() => {
            const nextDay = daysWithLocations.find(day => day > activeDay);
            if (nextDay) {
              setActiveDay(nextDay);
            }
          }}
          disabled={!daysWithLocations.includes(activeDay + 1)}
        >
          <Text style={styles.buttonText}>Next Location</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate('Map', { 
              fromLocation: tripData.from, 
              toLocation: tripData.to 
            })
          }
        >
          <Text style={styles.buttonText}>Map</Text>
        </TouchableOpacity>
      </View>
      <BottomTab screen="WhereToGo" style={styles.BottomTab} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, zIndex:2 },
  topSection: { flexDirection: 'row', ...alignment.Pmedium, alignItems: 'center', top: 160, zIndex: 2 },
  maincontainer:{
    flex: 1,
    zIndex: 2
  },
  fromToSection: { flex: 1, flexDirection: 'row', alignItems: 'center', marginTop: -50 },
  locationInfo: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 22, fontWeight: 'bold', ...alignment.MLmedium, color: colors.darkGray },
  dottedLineHorizontal: {
    fontSize: 16,
    color: colors.lightGray,
    paddingLeft: 20, // You can change 10 to any value you prefer
  },
  
  image: { width: 110, height: 110, borderRadius: 30, marginTop: -60 },
  title: { fontSize: 30, fontWeight: 'bold', ...alignment.MBsmall, ...alignment.MLmedium },

  tripPlanSection: { paddingHorizontal: 20, top: 140 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  sectionTitleplan: {
    fontSize: 18,
    fontWeight: 'bold',
    ...alignment.MBmedium,
    textAlign: 'center',
    ...alignment.Psmall,
    backgroundColor: colors.btncolor,
    borderRadius: 10,
    color: colors.white,
    width: 130,
    alignSelf: 'center',
  },
  backgroundCurvedContainer: {
    backgroundColor: colors.btncolor,
    height: 200,
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 0,
  },
  protractorShape: {
    backgroundColor: colors.white,
    height: 500,
    width: 1000,
    borderTopLeftRadius: 500,
    borderTopRightRadius: 500,
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    zIndex: 1,
    overflow: 'hidden',
  },
  ridersDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: -5,
    marginHorizontal: 15,
    ...alignment.MBlarge,
    top: 150
  },
  riders: { fontSize: 16, color: colors.darkGray, fontWeight: 'bold' },
  date: { fontSize: 16, color: colors.darkGray, fontWeight: 'bold' },

  daysTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    ...alignment.MBsmall,
    borderBottomWidth: 2,
    borderColor: colors.graycolor,
    backgroundColor: colors.grayLinesColor,
  },
  dayTab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  activeTab: { borderColor: colors.black },
  dayTabText: { fontSize: 16, color: colors.fontMainColor, fontWeight: 'bold' },
  activeTabText: { color: colors.black },

  dayPlanList: { paddingVertical: 2 , zIndex: 2},
  dayPlanItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    ...alignment.MLmedium,
  },
  iconAndLineContainer: {
    alignItems: 'center',
    ...alignment.MRsmall,
  },
  dottedLine: {
    width: 1,
    height: 20,
    backgroundColor: colors.black,
    marginVertical: 4,
  },
  locationDetails: {
    flex: 1,
    marginLeft: 10,
  },
  location: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkGray,
  },
  locationAddress: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 2,
  },
  locationDistance: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', ...alignment.Psmall },
  button: { flex: 1, marginHorizontal: 5, ...alignment.Psmall, backgroundColor: colors.btncolor, borderRadius: 5 },
  buttonText: { textAlign: 'center', color: colors.white, fontWeight: 'bold' },
  disabledButton: {
    opacity: 0.5,
  },
});

export default TripDetail;