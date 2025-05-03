import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // Import Material Icons
import styles from './styles'
import { useNavigation } from '@react-navigation/native';

function BackHeader(props) {
  const navigation = useNavigation();
  
  const handleSearchPress = () => {
    navigation.navigate('SearchPage');
  };
  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };
  const handleProfilePress = () => {
    navigation.navigate('ProfileDashboard');
  };
  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        {/* Back Arrow Inside Circle */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.leftContainer}
          onPress={() => props.backPressed()}>
          <View style={styles.circle}>
            <MaterialIcons name="chevron-left" size={28} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text numberOfLines={1} style={styles.headerText} >
          {props.title}
        </Text>
         {/* Right Icons */}
         <View style={styles.rightContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.iconButton}
            onPress={() => handleSearchPress()}>
            <Ionicons name="ios-search" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.iconButton}
            onPress={() => handleNotificationPress()}>
            <Ionicons name="notifications" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.iconButton}
            onPress={() => handleProfilePress()}>
            <Ionicons name="person" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

function HeaderRightText(props) {
  return (
    <View style={styles.container}>
      <View style={[styles.subContainer, { justifyContent: 'space-between' }]}>
        <View style={styles.titleContainer}>
          <TouchableOpacity
            activeOpacity={0}
            onPress={() => props.backPressed()}>
            <Ionicons name="ios-arrow-back" size={30} />
          </TouchableOpacity>
          <Text numberOfLines={1} style={styles.headerText}>
            {props.title}
          </Text>
        </View>
        <Text style={styles.rightTitle}>New Address</Text>
      </View>
    </View>
  )
}
export { BackHeader, HeaderRightText }
