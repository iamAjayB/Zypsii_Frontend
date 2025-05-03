import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Dimensions, Animated, Easing } from 'react-native';
import { colors } from "../../utils";
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 30; // Full width minus margins

const DirectionIndicator = ({ duration, distance }) => {
    const animation = useRef(new Animated.Value(0)).current;
    const pulseAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animation, {
                    toValue: 1,
                    duration: 8000,
                    useNativeDriver: true,
                    easing: Easing.bezier(0.4, 0.0, 0.2, 1),
                }),
                Animated.timing(animation, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnimation, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnimation, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const translateX = animation.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: [0, CARD_WIDTH - 60, CARD_WIDTH - 60, 0, 0],
    });

    const translateY = animation.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: [0, 30, 60, 30, 0],
    });

    const rotate = animation.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: ['0deg', '45deg', '90deg', '135deg', '180deg'],
    });

    const scale = pulseAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.05],
    });

    return (
        <View style={styles.directionContainer}>
            <View style={styles.roadContainer}>
                <View style={styles.roadInner}>
                    <View style={styles.roadLine} />
                    <View style={styles.roadLine} />
                    <View style={styles.roadLine} />
                    <View style={styles.roadLine} />
                    <View style={styles.roadLine} />
                </View>
                <View style={styles.roadEdgeLeft} />
                <View style={styles.roadEdgeRight} />
                <View style={styles.distanceInfo}>
                    <Text style={styles.distanceText}>{distance}</Text>
                    <Text style={styles.durationText}>{duration}</Text>
                </View>
            </View>
            <Animated.View 
                style={[
                    styles.bikeContainer, 
                    { 
                        transform: [
                            { translateX },
                            { translateY },
                            { rotate },
                            { scale }
                        ]
                    }
                ]}
            >
                <Ionicons name="bicycle" size={32} color={colors.Zypsii_color} style={styles.bikeIcon} />
                <View style={styles.bikeShadow} />
            </Animated.View>
        </View>
    );
};

// Nearby Places Card Component
const RecommendedScheduleCard = ({ onSchedulePress, onViewMorePress }) => {
    const suggestions = [
        {
            title: "Beach Day",
            places: [
                {
                    name: "Calangute Beach",
                    time: "10:00 AM - 2:00 PM",
                    icon: "🏖️",
                    activities: ["Sunbathing", "Beach Games", "Local Food", "Shopping"],
                    vehicle: "bike",
                    distance: "15 km",
                    duration: "30 mins",
                    description: "One of Goa's most popular beaches with golden sand and clear waters",
                    rating: "4.5",
                    price: "₹500-1000",
                    date: "2024-05-01"
                },
                {
                    name: "Baga Beach",
                    time: "3:00 PM - 6:00 PM",
                    icon: "🏖️",
                    activities: ["Water Sports", "Beach Relaxation", "Nightlife", "Dining"],
                    vehicle: "bike",
                    distance: "5 km",
                    duration: "10 mins",
                    description: "Famous for water sports and vibrant nightlife",
                    rating: "4.3",
                    price: "₹1000-2000",
                    date: "2024-05-02"
                }
            ]
        },
        {
            title: "Historical Tour",
            places: [
                {
                    name: "Fort Aguada",
                    time: "9:00 AM - 12:00 PM",
                    icon: "🏰",
                    activities: ["History", "Photography", "Scenic Views", "Light House"],
                    vehicle: "car",
                    distance: "20 km",
                    duration: "45 mins",
                    description: "17th-century Portuguese fort with panoramic views",
                    rating: "4.7",
                    price: "₹200-500",
                    date: "2024-05-03"
                },
                {
                    name: "Chapora Fort",
                    time: "2:00 PM - 5:00 PM",
                    icon: "🏰",
                    activities: ["History", "Scenic Views", "Sunset Point", "Photography"],
                    vehicle: "car",
                    distance: "25 km",
                    duration: "50 mins",
                    description: "Historic fort with stunning views of the Arabian Sea",
                    rating: "4.6",
                    price: "Free",
                    date: "2024-05-04"
                }
            ]
        },
        {
            title: "Nature & Wildlife",
            places: [
                {
                    name: "Dudhsagar Falls",
                    time: "8:00 AM - 12:00 PM",
                    icon: "🌊",
                    activities: ["Trekking", "Waterfall", "Swimming", "Nature Walk"],
                    vehicle: "jeep",
                    distance: "60 km",
                    duration: "2 hours",
                    description: "Majestic four-tiered waterfall in the Western Ghats",
                    rating: "4.8",
                    price: "₹1000-1500"
                },
                {
                    name: "Mollem National Park",
                    time: "1:00 PM - 4:00 PM",
                    icon: "🌳",
                    activities: ["Wildlife", "Nature Walk", "Bird Watching", "Photography"],
                    vehicle: "jeep",
                    distance: "5 km",
                    duration: "15 mins",
                    description: "Rich biodiversity with various species of flora and fauna",
                    rating: "4.4",
                    price: "₹500-800"
                }
            ]
        },
        {
            title: "Cultural Experience",
            places: [
                {
                    name: "Shri Shantadurga Temple",
                    time: "9:00 AM - 12:00 PM",
                    icon: "🛕",
                    activities: ["Temple Visit", "Local Culture"]
                },
                {
                    name: "Basilica of Bom Jesus",
                    time: "2:00 PM - 5:00 PM",
                    icon: "⛪",
                    activities: ["History", "Architecture"]
                }
            ]
        },
        {
            title: "Adventure Sports",
            places: [
                {
                    name: "Anjuna Beach",
                    time: "9:00 AM - 12:00 PM",
                    icon: "🏃",
                    activities: ["Paragliding", "Rock Climbing"]
                },
                {
                    name: "Candolim Beach",
                    time: "2:00 PM - 5:00 PM",
                    icon: "🏄",
                    activities: ["Jet Ski", "Parasailing"]
                }
            ]
        }
    ];
  
    const getVehicleIcon = (vehicle) => {
        switch(vehicle) {
            case 'bike':
                return '🚲';
            case 'car':
                return '🚗';
            case 'jeep':
                return '🚙';
            default:
                return '🚗';
        }
    };
  
    const renderActivities = (activities) => {
        return (
            <View style={styles.activitiesContainer}>
                {activities.slice(0, 2).map((activity, activityIndex) => (
                    <View key={activityIndex} style={styles.activityTag}>
                        <Text style={styles.activityText}>{activity}</Text>
                    </View>
                ))}
                {activities.length > 2 && (
                    <View style={styles.moreActivities}>
                        <Text style={styles.moreActivitiesText}>+{activities.length - 2} more</Text>
                    </View>
                )}
            </View>
        );
    };
  
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    };
  
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Suggested Itineraries</Text>
          <TouchableOpacity onPress={onViewMorePress}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          pagingEnabled
        >
          {suggestions.map((suggestion, index) => (
            <View key={index} style={[styles.suggestionCard, { width: CARD_WIDTH }]}>
              <View style={styles.suggestionHeader}>
                <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => onSchedulePress(suggestion)}
                >
                  <Ionicons name="add-circle-outline" size={16} color={colors.Zypsii_color} />
                </TouchableOpacity>
              </View>

              {suggestion.places.map((place, placeIndex) => (
                <React.Fragment key={placeIndex}>
                  <View style={styles.placeCard}>
                    <View style={styles.placeHeader}>
                      <View style={styles.markerContainer}>
                        <View style={[styles.marker, styles.dayMarker]}>
                          <Text style={styles.markerText}>Day {placeIndex + 1}</Text>
                          <Text style={styles.dateText}>{formatDate(place.date)}</Text>
                        </View>
                      </View>
                      <Text style={styles.placeIcon}>{place.icon}</Text>
                      <View style={styles.placeInfo}>
                        <Text style={styles.placeName}>{place.name}</Text>
                        <Text style={styles.placeTime}>{place.time}</Text>
                        <Text style={styles.placeDescription}>{place.description}</Text>
                        <View style={styles.placeMeta}>
                          <View style={styles.metaItem}>
                            <Ionicons name="star" size={12} color="#FFD700" />
                            <Text style={styles.metaText}>{place.rating}</Text>
                          </View>
                          <View style={styles.metaItem}>
                            <Ionicons name="cash-outline" size={12} color="#666" />
                            <Text style={styles.metaText}>{place.price}</Text>
                          </View>
                          <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={12} color="#666" />
                            <Text style={styles.metaText}>{place.duration}</Text>
                          </View>
                          <View style={styles.metaItem}>
                            <Ionicons name="location-outline" size={12} color="#666" />
                            <Text style={styles.metaText}>{place.distance}</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.vehicleContainer}>
                        <Text style={styles.vehicleIcon}>{getVehicleIcon(place.vehicle)}</Text>
                      </View>
                    </View>
                    {renderActivities(place.activities)}
                  </View>
                  {placeIndex < suggestion.places.length - 1 && (
                    <DirectionIndicator 
                      duration={suggestion.places[placeIndex + 1].duration}
                      distance={suggestion.places[placeIndex + 1].distance}
                    />
                  )}
                </React.Fragment>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    );
};

const styles = StyleSheet.create({
    container: {
      marginTop: 15,
      paddingBottom: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 15,
      marginBottom: 10,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
    },
    viewAllText: {
      fontSize: 14,
      color: colors.Zypsii_color,
    },
    scrollContent: {
      paddingHorizontal: 15,
      paddingBottom: 20,
    },
    suggestionCard: {
      backgroundColor: '#fff',
      borderRadius: 12,
      marginRight: 15,
      padding: 15,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    suggestionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    suggestionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
    },
    addButton: {
      backgroundColor: '#f8f8f8',
      padding: 6,
      borderRadius: 12,
    },
    placeCard: {
      backgroundColor: '#f8f8f8',
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
    },
    placeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    markerContainer: {
      width: 45,
      alignItems: 'center',
    },
    marker: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      marginRight: 6,
      alignItems: 'center',
    },
    dayMarker: {
      backgroundColor: colors.Zypsii_color,
      minWidth: 60,
    },
    markerText: {
      fontSize: 12,
      color: '#fff',
      fontWeight: 'bold',
    },
    dateText: {
      fontSize: 10,
      color: '#fff',
      marginTop: 2,
    },
    placeIcon: {
      fontSize: 20,
      marginRight: 10,
    },
    placeInfo: {
      flex: 1,
    },
    placeName: {
      fontSize: 14,
      fontWeight: '600',
      color: '#333',
    },
    placeTime: {
      fontSize: 12,
      color: '#666',
      marginTop: 4,
    },
    activitiesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    activityTag: {
      backgroundColor: '#fff',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      marginRight: 8,
      marginBottom: 8,
    },
    activityText: {
      fontSize: 12,
      color: '#666',
    },
    vehicleContainer: {
      marginLeft: 10,
      padding: 4,
      backgroundColor: '#f0f0f0',
      borderRadius: 6,
    },
    vehicleIcon: {
      fontSize: 16,
    },
    placeDescription: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        lineHeight: 16,
    },
    placeMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        gap: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    metaText: {
        fontSize: 10,
        color: '#666',
        marginLeft: 4,
    },
    moreActivities: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    moreActivitiesText: {
        fontSize: 10,
        color: '#666',
    },
    directionContainer: {
        height: 120,
        marginVertical: 8,
        position: 'relative',
        paddingHorizontal: 15,
    },
    roadContainer: {
        position: 'absolute',
        top: 20,
        left: 15,
        right: 15,
        height: 80,
        backgroundColor: '#E8E8E8',
        borderRadius: 40,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#D0D0D0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    roadInner: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 40,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    roadLine: {
        width: 20,
        height: 4,
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 2,
        transform: [{ rotate: '45deg' }],
    },
    roadEdgeLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: 8,
        backgroundColor: '#D8D8D8',
        borderTopLeftRadius: 40,
        borderBottomLeftRadius: 40,
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    roadEdgeRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 8,
        backgroundColor: '#D8D8D8',
        borderTopRightRadius: 40,
        borderBottomRightRadius: 40,
        shadowColor: '#000',
        shadowOffset: { width: -1, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    distanceInfo: {
        position: 'absolute',
        top: 0,
        right: 10,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    distanceText: {
        fontSize: 12,
        color: colors.Zypsii_color,
        fontWeight: '600',
        marginBottom: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
    durationText: {
        fontSize: 10,
        color: colors.Zypsii_color,
        fontWeight: '500',
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
    bikeContainer: {
        position: 'absolute',
        top: 40,
        left: 15,
        zIndex: 2,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    bikeIcon: {
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        transform: [{ scale: 1.2 }],
    },
    bikeShadow: {
        width: 30,
        height: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 3,
        marginTop: 2,
        transform: [{ scaleX: 0.8 }],
    },
    roadDetails: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    roadMarker: {
        width: 6,
        height: 6,
        backgroundColor: '#FFFFFF',
        borderRadius: 3,
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
});

export default RecommendedScheduleCard;