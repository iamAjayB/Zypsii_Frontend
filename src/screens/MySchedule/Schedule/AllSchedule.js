import React from 'react';
import { View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import { styles } from './styles';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import Icon from 'react-native-vector-icons/Ionicons'; // Import vector icons
import { AntDesign } from '@expo/vector-icons'; // Import AntDesign icons
import { colors } from '../../../utils';// Import colors

const Schedule = ({item}) => {
  const navigation = useNavigation(); // Access navigation object

  const handleCardPress = (item) => {
    navigation.navigate('TripDetail', { tripData: item }); // Navigate and pass data
  };

  return (
    <View style={styles.container}>
     
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => handleCardPress(item)} // Navigate to TripDetail
          >
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={styles.cardContent}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.routeRow}>
                <View style={styles.routeItem}>
                  <Text style={styles.routeLabel}>From</Text>
                  <View style={styles.locationRow}>
                    <Icon name="location-outline" size={16} color="#333" />
                    <Text style={styles.routeText}>
                    {item.from.length > 5 ? item.from.slice(0, 5) + '...' : item.from}
                  </Text>
                  </View>
                </View>
                <View style={styles.routeItem}>
                  <Text style={styles.routeLabel}>To</Text>
                  <View style={styles.locationRow}>
                    <Icon name="location-outline" size={16} color="#333" />
                    <Text style={styles.routeText}>
                      {item.to.length > 5 ? item.to.slice(0, 5) + '...' : item.to}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.date}>📅 {item.date}</Text>
              <Text style={styles.riders}>🏍️ ({item.riders})</Text>
              <View style={styles.ratingContainer}>
                <AntDesign name="star" size={18} color={colors.Zypsii_color} />
                <Text style={styles.ratingText}>{item.rating || '0.0'}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.joinedButton}>
              <Text style={styles.joinedText}>{item.joined ? 'Joined' : 'Join'}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
       
    </View>
  );
};

export default Schedule;
