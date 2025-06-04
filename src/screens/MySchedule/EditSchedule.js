import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  ImageBackground,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils';
import { base_url } from '../../utils/base_url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './styles';
import MapView, { Marker } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const EditSchedule = ({ route, navigation }) => {
  const { scheduleId, scheduleData } = route.params;
  const [loading, setLoading] = useState(false);
  const [bannerImage, setBannerImage] = useState(scheduleData?.imageUrl || null);
  const [formData, setFormData] = useState({
    tripName: scheduleData?.title || '',
    description: scheduleData?.description || '',
    numberOfDays: scheduleData?.riders || '',
    travelMode: scheduleData?.travelMode || '',
    fromPlace: scheduleData?.fromPlace || '',
    toPlace: scheduleData?.toPlace || '',
    date: scheduleData?.date || '',
    budget: scheduleData?.budget || '',
    maxRiders: scheduleData?.maxRiders || '',
    privacy: scheduleData?.privacy || 'Public',
  });

  // Add state for day schedules with location data
  const [daySchedules, setDaySchedules] = useState([
    { 
      day: 1, 
      activities: '', 
      time: '',
      location: '',
      description: '',
      planDescription: [],
      latitude: '',
      longitude: ''
    }
  ]);

  // Fetch schedule description data
  useEffect(() => {
    const fetchScheduleDescription = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const user = await AsyncStorage.getItem('user');
        const currentUserId = user ? JSON.parse(user)._id : null;

        if (!accessToken || !currentUserId) {
          console.error('Missing token or userId');
          return;
        }

        const response = await fetch(
          `${base_url}/schedule/listing/scheduleDescription/${scheduleId}/${currentUserId}?offset=0&limit=10`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );

        const data = await response.json();
        console.log(data);
        
        if (data.success && data.data) {
          // Transform the API data into daySchedules format
          const transformedSchedules = data.data.map((day, index) => ({
            day: index + 1,
            activities: '',
            time: '',
            location: day.planDescription?.[0]?.name || '',
            description: day.Description || '',
            planDescription: day.planDescription || [],
            latitude: day.planDescription?.[0]?.location?.lat || '',
            longitude: day.planDescription?.[0]?.location?.lng || ''
          }));
          
          setDaySchedules(transformedSchedules);
        }
      } catch (error) {
        console.error('Error fetching schedule description:', error);
        Alert.alert('Error', 'Failed to load schedule details');
      }
    };

    fetchScheduleDescription();
  }, [scheduleId]);

  // Handle location update from map screen
  useEffect(() => {
    if (route.params?.latitude && route.params?.longitude) {
      const { latitude, longitude, dayId } = route.params;
      const updatedDaySchedules = daySchedules.map(day => {
        if (day.day === dayId) {
          return {
            ...day,
            latitude: latitude.toString(),
            longitude: longitude.toString()
          };
        }
        return day;
      });
      setDaySchedules(updatedDaySchedules);
      
      // Clear the route params to prevent duplicate updates
      navigation.setParams({ latitude: undefined, longitude: undefined, dayId: undefined });
    }
  }, [route.params]);

  // Function to open map for location selection
  const openMapForDay = (dayId) => {
    navigation.navigate('MapScreen', { 
      dayId,
      initialLocation: {
        latitude: parseFloat(daySchedules.find(day => day.day === dayId)?.latitude || 0),
        longitude: parseFloat(daySchedules.find(day => day.day === dayId)?.longitude || 0)
      }
    });
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const accessToken = await AsyncStorage.getItem('accessToken');
      
      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append('tripName', formData.tripName);
      formDataToSend.append('numberOfDays', parseInt(formData.numberOfDays));
      formDataToSend.append('travelMode', formData.travelMode);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('budget', formData.budget);
      formDataToSend.append('maxRiders', formData.maxRiders);
      formDataToSend.append('privacy', formData.privacy);
      
      // Append banner image if changed
      if (bannerImage && bannerImage.startsWith('file://')) {
        formDataToSend.append('bannerImage', {
          uri: bannerImage,
          type: 'image/jpeg',
          name: 'banner.jpg'
        });
      }

      // Format day schedules with location data
      const formattedDaySchedules = daySchedules.map(day => ({
        Description: day.description,
        date: formData.date,
        planDescription: day.planDescription.map(location => ({
          name: location.name,
          address: location.address,
          location: location.location,
          distanceInKilometer: location.distanceInKilometer
        }))
      }));

      // Append day schedules
      formDataToSend.append('daySchedules', JSON.stringify(formattedDaySchedules));

      // First update the main schedule data
      const response = await fetch(`${base_url}/schedule/edit/${scheduleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Failed to update schedule');
      }

      // Then update the description
      const descriptionResponse = await fetch(
        `${base_url}/schedule/edit/descriptions/${scheduleId}/${scheduleId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: formData.description,
          }),
        }
      );

      if (!descriptionResponse.ok) {
        throw new Error('Failed to update description');
      }

      Alert.alert('Success', 'Schedule updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add new day schedule
  const addDaySchedule = () => {
    setDaySchedules([...daySchedules, { 
      day: daySchedules.length + 1, 
      activities: '', 
      time: '',
      location: '',
      description: '',
      planDescription: [],
      latitude: '',
      longitude: ''
    }]);
  };

  // Remove day schedule
  const removeDaySchedule = (index) => {
    if (daySchedules.length > 1) {
      const newDaySchedules = daySchedules.filter((_, i) => i !== index);
      const updatedDaySchedules = newDaySchedules.map((schedule, i) => ({
        ...schedule,
        day: i + 1
      }));
      setDaySchedules(updatedDaySchedules);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Schedule</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Banner Image Section */}
        <View style={styles.bannerContainer}>
          {bannerImage ? (
            <ImageBackground
              source={{ uri: bannerImage }}
              style={styles.bannerImage}
              resizeMode="cover"
            >
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.bannerGradient}
              >
                <Text style={styles.bannerTitle}>{formData.tripName}</Text>
              </LinearGradient>
            </ImageBackground>
          ) : (
            <View style={styles.bannerPlaceholder}>
              <Text style={styles.bannerTitle}>{formData.tripName}</Text>
            </View>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>BASIC DETAILS</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Trip Name</Text>
            <TextInput
              style={styles.input}
              value={formData.tripName}
              onChangeText={(text) => setFormData({ ...formData, tripName: text })}
              placeholder="Enter trip name"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Number of Days</Text>
              <TextInput
                style={styles.input}
                value={formData.numberOfDays}
                onChangeText={(text) => setFormData({ ...formData, numberOfDays: text })}
                placeholder="Enter days"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Max Riders</Text>
              <TextInput
                style={styles.input}
                value={formData.maxRiders}
                onChangeText={(text) => setFormData({ ...formData, maxRiders: text })}
                placeholder="Enter max riders"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Travel Mode</Text>
              <TextInput
                style={styles.input}
                value={formData.travelMode}
                onChangeText={(text) => setFormData({ ...formData, travelMode: text })}
                placeholder="Enter travel mode"
              />
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Budget</Text>
              <TextInput
                style={styles.input}
                value={formData.budget}
                onChangeText={(text) => setFormData({ ...formData, budget: text })}
                placeholder="Enter budget"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>LOCATION</Text>
          <View style={styles.row}>
            <View style={styles.formGroup}>
              <View style={styles.inputContainer}>
                <Ionicons name="location" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.fromPlace}
                  onChangeText={(text) => setFormData({ ...formData, fromPlace: text })}
                  placeholder="From location"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            <View style={styles.formGroup}>
              <View style={styles.inputContainer}>
                <Ionicons name="location" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.toPlace}
                  onChangeText={(text) => setFormData({ ...formData, toPlace: text })}
                  placeholder="To location"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>PLAN DESCRIPTION</Text>
          {daySchedules.map((daySchedule, index) => (
            <View key={index} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayTitle}>{`Day ${daySchedule.day}`}</Text>
                {daySchedules.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeDayButton}
                    onPress={() => removeDaySchedule(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#e53935" />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                onPress={() => openMapForDay(daySchedule.day)}
                style={styles.mapButton}
              >
                <Ionicons name="location-sharp" size={24} color="white" />
                <Text style={styles.mapButtonText}>Select Location</Text>
              </TouchableOpacity>

              {daySchedule.latitude && daySchedule.longitude && (
                <View style={styles.mapContainer}>
                  <MapView
                    style={styles.map}
                    initialRegion={{
                      latitude: parseFloat(daySchedule.latitude),
                      longitude: parseFloat(daySchedule.longitude),
                      latitudeDelta: 0.0922,
                      longitudeDelta: 0.0421,
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: parseFloat(daySchedule.latitude),
                        longitude: parseFloat(daySchedule.longitude),
                      }}
                    />
                  </MapView>
                </View>
              )}

              <View style={styles.timeContainer}>
                <TouchableOpacity 
                  style={styles.timeButton}
                  onPress={() => openTimePicker(index, 'start')}
                >
                  <Text style={styles.timeText}>
                    Start: {daySchedule.startTime || "09:00"}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.timeButton}
                  onPress={() => openTimePicker(index, 'end')}
                >
                  <Text style={styles.timeText}>
                    End: {daySchedule.endTime || "17:00"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Display plan description locations */}
              {daySchedule.planDescription && daySchedule.planDescription.length > 0 && (
                <View style={styles.locationList}>
                  {daySchedule.planDescription.map((location, locIndex) => (
                    <View key={locIndex} style={styles.locationItem}>
                      <Text style={styles.locationName}>{location.name}</Text>
                      <Text style={styles.locationAddress}>{location.address}</Text>
                      <Text style={styles.locationDistance}>{location.distanceInKilometer}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.addDayButton} onPress={addDaySchedule}>
            <Ionicons name="add-circle" size={24} color="#A60F93" />
            <Text style={styles.addDayButtonText}>Add Another Day</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.updateButtonText}>Update Schedule</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditSchedule; 