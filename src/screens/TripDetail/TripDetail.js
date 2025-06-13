import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { BackHeader, BottomTab } from '../../components';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { alignment, colors } from '../../utils';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { base_url } from '../../utils/base_url';

const TripDetail = ({ route, navigation }) => {
  const { tripData } = route.params || {};
  const [activeDay, setActiveDay] = useState(1);
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placeDescriptions, setPlaceDescriptions] = useState([]);
  const [isBackButtonLoading, setIsBackButtonLoading] = useState(false);
  
  // Default values if tripData is undefined
  const defaultTripData = {
    id: '',
    title: 'Trip',
    from: 'Starting Point',
    to: 'End Point',
    date: new Date().toISOString().split('T')[0],
    numberOfDays: '1',
    imageUrl: null,
    locationDetails: [],
    riders: '1',
    travelMode: 'Bike',
    visible: 'Public'
  };

  // Use tripData if available, otherwise use default values
  const safeTripData = tripData || defaultTripData;
  
  // Enhanced color scheme
  const enhancedColors = {
    primary: colors.btncolor || '#4A90E2',
    primaryDark: '#357ABD',
    primaryLight: '#E3F2FD',
    secondary: '#FF6B6B',
    accent: '#4ECDC4',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#2C3E50',
    textSecondary: '#7F8C8D',
    border: '#E1E8ED',
    shadow: 'rgba(0, 0, 0, 0.1)',
    success: '#27AE60',
    warning: '#F39C12',
    error: '#E74C3C',
  };
  
  const getFixedLocations = () => {
    const allLocations = safeTripData.locationDetails;
    return {
      from: allLocations[0]?.name || 'Starting Point',
      to: allLocations[allLocations.length - 1]?.name || 'End Point'
    };
  };

  console.log(safeTripData);

  useEffect(() => {
    getPlaceDescriptions();
  }, []);

  const getPlaceDescriptions = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get(
        `${base_url}/schedule/places/getNearest`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.data) {
        const descriptions = response.data.data.map(place => ({
          id: place._id,
          name: place.name,
          description: place.description || place.address,
          location: place.location
        }));
        setPlaceDescriptions(descriptions);
      }
    } catch (error) {
      console.error('Error fetching place descriptions:', error);
      setPlaceDescriptions([]);
    }
  };

  const backPressed = () => {
    if (isBackButtonLoading) return;
    
    setIsBackButtonLoading(true);
    try {
      navigation.goBack();
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setTimeout(() => {
        setIsBackButtonLoading(false);
      }, 1000);
    }
  };

  const getLocationsForDay = (day) => {
    if (scheduleData && scheduleData.length > 0) {
      const dayData = scheduleData.find(item => item.day === day);
      if (dayData && dayData.locations && dayData.locations.length > 0) {
        return dayData.locations.map(location => {
          const placeInfo = placeDescriptions.find(place => place.id === location.id);
          return {
            ...location,
            description: placeInfo?.description || location.description
          };
        });
      }
    }
    
    const locationsPerDay = Math.ceil(safeTripData.locationDetails.length / parseInt(safeTripData.numberOfDays));
    const startIndex = (day - 1) * locationsPerDay;
    const endIndex = Math.min(startIndex + locationsPerDay, safeTripData.locationDetails.length);
    const locations = safeTripData.locationDetails.slice(startIndex, endIndex);
    
    return locations.map(location => {
      const placeInfo = placeDescriptions.find(place => place.id === location.id);
      return {
        ...location,
        description: placeInfo?.description || location.description
      };
    });
  };

  const getDayTitle = (day) => {
    if (scheduleData && scheduleData.length > 0) {
      const dayData = scheduleData.find(item => item.day === day);
      if (dayData && dayData.description) {
        return dayData.description;
      }
    }
    
    const dayLocations = getLocationsForDay(day);
    if (dayLocations.length > 0) {
      return dayLocations[0].name || `Day ${day}`;
    }
    return `Day ${day}`;
  };

  const daysWithLocations = Array.from(
    { length: parseInt(safeTripData.numberOfDays) }, 
    (_, i) => i + 1
  ).filter(day => getLocationsForDay(day).length > 0);

  const renderDayPlan = ({ item, index, arrayLength }) => (
    <View style={[styles.dayPlanItem, { borderColor: enhancedColors.border }]}>
      <View style={styles.iconAndLineContainer}>
        <View style={[styles.locationIconContainer, { backgroundColor: enhancedColors.primary }]}>
          <Icon name="map-marker" size={16} color={enhancedColors.surface} />
        </View>
        {index < arrayLength - 1 && (
          <View style={[styles.dottedLine, { backgroundColor: enhancedColors.border }]} />
        )}
      </View>
      <View style={styles.locationDetails}>
        <Text style={[styles.location, { color: enhancedColors.text }]}>{item.name}</Text>
        <Text style={[styles.locationAddress, { color: enhancedColors.textSecondary }]}>
          {item.address}
        </Text>
        {item.distanceInKilometer && (
          <View style={styles.distanceContainer}>
            <Icon name="road-variant" size={12} color={enhancedColors.accent} />
            <Text style={[styles.locationDistance, { color: enhancedColors.accent }]}>
              {item.distanceInKilometer}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: enhancedColors.background 
    },
    topSection: { 
      flexDirection: 'row', 
      paddingHorizontal: 20,
      paddingVertical: 15,
      alignItems: 'center',
      marginTop: 60,
      zIndex: 3
    },
    maincontainer: {
      flex: 1,
      zIndex: 2
    },
    fromToSection: { 
      flex: 1, 
      flexDirection: 'column', 
      alignItems: 'flex-start',
      backgroundColor: enhancedColors.surface,
      padding: 20,
      borderRadius: 15,
      marginRight: 15,
      shadowColor: enhancedColors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    fromToHeading: {
      fontSize: 14,
      fontWeight: '600',
      color: enhancedColors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    locationInfo: { 
      flexDirection: 'row', 
      alignItems: 'center',
      marginVertical: 8,
      width: '100%'
    },
    locationText: { 
      fontSize: 16, 
      fontWeight: '700', 
      marginLeft: 8, 
      color: enhancedColors.text,
      flex: 1
    },
    verticalLine: {
      width: 2,
      height: 25,
      backgroundColor: enhancedColors.primary,
      marginLeft: 8,
      marginVertical: 8,
      borderRadius: 1,
    },
    image: { 
      width: 120, 
      height: 120, 
      borderRadius: 20,
      borderWidth: 3,
      borderColor: enhancedColors.surface,
      shadowColor: enhancedColors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    backgroundCurvedContainer: {
      backgroundColor: enhancedColors.primary,
      height: 250,
      width: '100%',
      position: 'absolute',
      top: 0,
      zIndex: 0,
    },
    protractorShape: {
      backgroundColor: enhancedColors.background,
      height: 600,
      width: 1200,
      borderTopLeftRadius: 600,
      borderTopRightRadius: 600,
      position: 'absolute',
      top: 120,
      alignSelf: 'center',
      zIndex: 1,
      overflow: 'hidden',
    },
    ridersDateContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: 20,
      marginVertical: 20,
      backgroundColor: enhancedColors.surface,
      padding: 15,
      borderRadius: 12,
      shadowColor: enhancedColors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      zIndex: 2,
    },
    riders: { 
      fontSize: 15, 
      color: enhancedColors.text, 
      fontWeight: '600',
      backgroundColor: enhancedColors.primaryLight,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    date: { 
      fontSize: 15, 
      color: enhancedColors.text, 
      fontWeight: '600',
      flexDirection: 'row',
      alignItems: 'center',
    },
    tripPlanSection: { 
      paddingHorizontal: 20,
      marginTop: 10,
      zIndex: 2,
    },
    sectionTitle: { 
      fontSize: 22, 
      fontWeight: '700', 
      marginBottom: 15, 
      textAlign: 'center',
      color: enhancedColors.text,
    },
    sectionTitleplan: {
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      backgroundColor: enhancedColors.primary,
      borderRadius: 25,
      color: enhancedColors.surface,
      alignSelf: 'center',
      marginBottom: 20,
      shadowColor: enhancedColors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    daysTabs: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      marginBottom: 20,
      backgroundColor: enhancedColors.surface,
      borderRadius: 15,
      padding: 5,
      shadowColor: enhancedColors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    dayTab: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      minWidth: 80,
      alignItems: 'center',
    },
    activeTab: { 
      backgroundColor: enhancedColors.primary,
      shadowColor: enhancedColors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    dayTabText: { 
      fontSize: 14, 
      color: enhancedColors.textSecondary, 
      fontWeight: '600',
      textAlign: 'center',
    },
    activeTabText: { 
      color: enhancedColors.surface,
      fontWeight: '700',
    },
    dayPlanList: { 
      backgroundColor: enhancedColors.surface,
      borderRadius: 15,
      padding: 15,
      marginBottom: 100,
      shadowColor: enhancedColors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    dayPlanItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: enhancedColors.border,
      marginHorizontal: 5,
    },
    iconAndLineContainer: {
      alignItems: 'center',
      marginRight: 15,
      paddingTop: 2,
    },
    locationIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: enhancedColors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    dottedLine: {
      width: 2,
      height: 30,
      marginVertical: 8,
      borderRadius: 1,
    },
    locationDetails: {
      flex: 1,
      paddingTop: 2,
    },
    location: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 4,
      lineHeight: 22,
    },
    locationAddress: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 6,
    },
    distanceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
    },
    locationDistance: {
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
    },
    buttonContainer: { 
      flexDirection: 'row', 
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: enhancedColors.surface,
      borderTopWidth: 1,
      borderTopColor: enhancedColors.border,
      position: 'absolute',
      bottom: 60,
      left: 0,
      right: 0,
      zIndex: 10,
    },
    button: { 
      flex: 1, 
      marginHorizontal: 5, 
      paddingVertical: 14,
      paddingHorizontal: 12,
      backgroundColor: enhancedColors.primary, 
      borderRadius: 12,
      shadowColor: enhancedColors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    buttonText: { 
      textAlign: 'center', 
      color: enhancedColors.surface, 
      fontWeight: '700',
      fontSize: 14,
    },
    disabledButton: {
      opacity: 0.5,
      shadowOpacity: 0.1,
      elevation: 2,
    },
    BottomTab: {
      zIndex: 5,
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.protractorShape} />
      <View style={styles.backgroundCurvedContainer} />
      <View style={styles.maincontainer}>
        
        <BackHeader 
          backPressed={backPressed}
          navigation={navigation}
          title="Trip Details"
          style={{ marginTop: 20, zIndex: 4 }}
        />

        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topSection}>
            <View style={styles.fromToSection}>
              <Text style={styles.fromToHeading}>From</Text>
              <TouchableOpacity style={styles.locationInfo}>
                <Icon name="map-marker-outline" size={20} color={enhancedColors.primary} />
                <Text style={styles.locationText}>
                  {getFixedLocations().from}
                </Text>
              </TouchableOpacity>
              <View style={styles.verticalLine} />
              <Text style={styles.fromToHeading}>To</Text>
              <TouchableOpacity style={styles.locationInfo}>
                <Icon name="map-marker-outline" size={20} color={enhancedColors.primary} />
                <Text style={styles.locationText}>
                  {getFixedLocations().to}
                </Text>
              </TouchableOpacity>
            </View>

            <Image source={{ uri: safeTripData.imageUrl }} style={styles.image} />
          </View>

          <View style={styles.ridersDateContainer}>
            <Text style={styles.date}>
              <Icon name="calendar-outline" size={18} color={enhancedColors.primary} /> 
              {' '}
              {scheduleData[activeDay - 1]?.date 
                ? new Date(scheduleData[activeDay - 1].date).toLocaleDateString() 
                : safeTripData.date}
            </Text>
            <Text style={styles.riders}>
              🏍️ Riders: {safeTripData.riders}
            </Text>
          </View>

          <View style={styles.tripPlanSection}>
            {/* <Text style={styles.sectionTitle}>Trip Detail Plan</Text>
            <TouchableOpacity 
              onPress={() =>
                navigation.navigate('Map', { 
                  tripId: safeTripData.id
                })
              }
            >
              <Text style={styles.sectionTitleplan}>📍 View All Locations</Text>
            </TouchableOpacity> */}

            <View style={styles.daysTabs}>
              {daysWithLocations.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayTab, activeDay === day && styles.activeTab]}
                  onPress={() => setActiveDay(day)}
                >
                  <Text style={[styles.dayTabText, activeDay === day && styles.activeTabText]}>
                    Day {day}
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
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </ScrollView>
      </View>

      <View style={styles.buttonContainer}>
        {/* <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('MakeSchedule')}
        >
          <Text style={styles.buttonText}>✏️ Change Plan</Text>
        </TouchableOpacity> */}
        
        <TouchableOpacity 
          style={[styles.button, !daysWithLocations.find(day => day > activeDay) && styles.disabledButton]}
          onPress={() => {
            const nextDay = daysWithLocations.find(day => day > activeDay);
            if (nextDay) {
              setActiveDay(nextDay);
            }
          }}
          disabled={!daysWithLocations.find(day => day > activeDay)}
        >
          <Text style={styles.buttonText}>➡️ Next Day</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate('Map', { 
              locations: getLocationsForDay(activeDay).map(location => ({
                name: location.name,
                address: location.address,
                location: location.location,
                distanceInKilometer: location.distanceInKilometer
              }))
            })
          }
        >
          <Text style={styles.buttonText}>🗺️ Map</Text>
        </TouchableOpacity>
      </View>
      <BottomTab screen="WhereToGo" style={styles.BottomTab} />
    </View>
  );
};

export default TripDetail;