import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils';

const { width } = Dimensions.get('window');

const PlaceDetailsScreen = ({ route, navigation }) => {
    const { place, isAllPlaces, places } = route.params;
    const [isExpanded, setIsExpanded] = useState(false);

    const renderPlaceCard = (place, index) => {
        const isBagaBeach = place.name === "Baga Beach";
        
        return (
            <View key={index} style={styles.placeCard}>
                <View style={styles.dayHeader}>
                    <View style={styles.dayMarker}>
                        <Text style={styles.dayText}>Day {index + 1}</Text>
                        <Text style={styles.dateText}>{place.date}</Text>
                    </View>
                </View>
                <View style={styles.placeContent}>
                    <View style={styles.placeHeader}>
                        <Text style={styles.placeIcon}>{place.icon}</Text>
                        <View style={styles.placeInfo}>
                            <Text style={styles.placeName}>{place.name}</Text>
                            <Text style={styles.placeTime}>{place.time}</Text>
                        </View>
                    </View>
                    
                    {isBagaBeach ? (
                        <>
                            <TouchableOpacity 
                                style={styles.expandButton}
                                onPress={() => setIsExpanded(!isExpanded)}
                            >
                                <Text style={styles.expandButtonText}>
                                    {isExpanded ? 'Hide Details' : 'Show Details'}
                                </Text>
                                <Ionicons 
                                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                                    size={20} 
                                    color={colors.Zypsii_color} 
                                />
                            </TouchableOpacity>
                            
                            {isExpanded && (
                                <>
                                    <Text style={styles.placeDescription}>{place.description}</Text>
                                    <View style={styles.placeMeta}>
                                        <View style={styles.metaItem}>
                                            <Ionicons name="star" size={16} color="#FFD700" />
                                            <Text style={styles.metaText}>{place.rating}</Text>
                                        </View>
                                        <View style={styles.metaItem}>
                                            <Ionicons name="cash-outline" size={16} color="#666" />
                                            <Text style={styles.metaText}>{place.price}</Text>
                                        </View>
                                        <View style={styles.metaItem}>
                                            <Ionicons name="time-outline" size={16} color="#666" />
                                            <Text style={styles.metaText}>{place.duration}</Text>
                                        </View>
                                        <View style={styles.metaItem}>
                                            <Ionicons name="location-outline" size={16} color="#666" />
                                            <Text style={styles.metaText}>{place.distance}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.activitiesContainer}>
                                        {place.activities.map((activity, activityIndex) => (
                                            <View key={activityIndex} style={styles.activityTag}>
                                                <Text style={styles.activityText}>{activity}</Text>
                                            </View>
                                        ))}
                                    </View>
                                    <View style={styles.vehicleContainer}>
                                        <Text style={styles.vehicleIcon}>
                                            {place.vehicle === 'bike' ? '🚲' : place.vehicle === 'car' ? '🚗' : '🚙'}
                                        </Text>
                                        <Text style={styles.vehicleText}>
                                            {place.vehicle.charAt(0).toUpperCase() + place.vehicle.slice(1)}
                                        </Text>
                                    </View>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <Text style={styles.placeDescription}>{place.description}</Text>
                            <View style={styles.placeMeta}>
                                <View style={styles.metaItem}>
                                    <Ionicons name="star" size={16} color="#FFD700" />
                                    <Text style={styles.metaText}>{place.rating}</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Ionicons name="cash-outline" size={16} color="#666" />
                                    <Text style={styles.metaText}>{place.price}</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Ionicons name="time-outline" size={16} color="#666" />
                                    <Text style={styles.metaText}>{place.duration}</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Ionicons name="location-outline" size={16} color="#666" />
                                    <Text style={styles.metaText}>{place.distance}</Text>
                                </View>
                            </View>
                            <View style={styles.activitiesContainer}>
                                {place.activities.map((activity, activityIndex) => (
                                    <View key={activityIndex} style={styles.activityTag}>
                                        <Text style={styles.activityText}>{activity}</Text>
                                    </View>
                                ))}
                            </View>
                            <View style={styles.vehicleContainer}>
                                <Text style={styles.vehicleIcon}>
                                    {place.vehicle === 'bike' ? '🚲' : place.vehicle === 'car' ? '🚗' : '🚙'}
                                </Text>
                                <Text style={styles.vehicleText}>
                                    {place.vehicle.charAt(0).toUpperCase() + place.vehicle.slice(1)}
                                </Text>
                            </View>
                        </>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.Zypsii_color} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {isAllPlaces ? 'All Places' : 'Place Details'}
                </Text>
            </View>

            <ScrollView style={styles.content}>
                {isAllPlaces ? (
                    places.map((place, index) => renderPlaceCard(place, index))
                ) : (
                    renderPlaceCard(place, 0)
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    placeCard: {
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
    },
    dayHeader: {
        backgroundColor: colors.Zypsii_color,
        padding: 12,
    },
    dayMarker: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dayText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    dateText: {
        fontSize: 14,
        color: '#fff',
    },
    placeContent: {
        padding: 16,
    },
    placeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    placeIcon: {
        fontSize: 32,
        marginRight: 12,
    },
    placeInfo: {
        flex: 1,
    },
    placeName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    placeTime: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    placeDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    },
    placeMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
        gap: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    metaText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    activitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
        gap: 8,
    },
    activityTag: {
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    activityText: {
        fontSize: 12,
        color: '#666',
    },
    vehicleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    vehicleIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    vehicleText: {
        fontSize: 14,
        color: '#666',
    },
    expandButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        padding: 8,
        borderRadius: 8,
        marginVertical: 8,
    },
    expandButtonText: {
        color: colors.Zypsii_color,
        fontSize: 14,
        fontWeight: '600',
        marginRight: 8,
    },
});

export default PlaceDetailsScreen; 