import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { TextDefault } from '../../components';
import { colors } from "../../utils";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const DiscoverByNearest = (props) => {
  return (
    <View style={styles.discoverCard}>
      <Image source={{ uri: props.image }} style={styles.discoverCardImage} />
      <View style={styles.discoverCardContent}>
        <TextDefault numberOfLines={1} style={styles.discoverCardTitle}>
          {props.title}
        </TextDefault>
        <TextDefault numberOfLines={2} style={styles.discoverCardSubtitle}>
          {props.subtitle}
        </TextDefault>
        <View style={styles.discoverCardFooter}>
          <View style={styles.discoverCardDistance}>
            <Ionicons name="location-outline" size={14} color={colors.Zypsii_color} />
            <TextDefault style={styles.distanceText}>
            {props.distance ? `${props.distance} km` : 'N/A'}
            </TextDefault>
          </View>
          <View style={styles.discoverCardRating}>
            <MaterialIcons name="star" size={14} color={colors.Zypsii_color} />
            <TextDefault style={styles.ratingText}>
            {!isNaN(Number(props.rating)) ? Number(props.rating).toFixed(1) : '0.0'}
            </TextDefault>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  discoverCard: {
    width: 150,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginRight: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  discoverCardImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  discoverCardContent: {
    padding: 10,
  },
  discoverCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.fontMainColor,
    marginBottom: 4,
  },
  discoverCardSubtitle: {
    fontSize: 12,
    color: colors.fontThirdColor,
    marginBottom: 8,
  },
  discoverCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discoverCardDistance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 12,
    color: colors.fontThirdColor,
    marginLeft: 4,
  },
  discoverCardRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: colors.fontMainColor,
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default DiscoverByNearest;
