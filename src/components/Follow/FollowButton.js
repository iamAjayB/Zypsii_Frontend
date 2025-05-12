import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFollow } from './FollowContext';
import { useAuth } from '../Auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';

const FollowButton = ({ userId }) => {
  const { user } = useAuth();
  const { 
    isFollowing, 
    followUser, 
    unfollowUser, 
    isLoading 
  } = useFollow();

  const handlePress = async () => {
    if (!user?._id) {
      console.warn("User not logged in");
      return;
    }
    
    try {
      if (isFollowing(userId)) {
        await unfollowUser(user._id, userId);
      } else {
        await followUser(user._id, userId);
      }
    } catch (error) {
      console.error("Follow action failed:", error.message);
      // You might want to show an error message to the user here
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isFollowing(userId) ? styles.following : styles.notFollowing,
        isLoading && styles.disabled
      ]}
      onPress={handlePress}
      disabled={isLoading || !user?._id}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={isFollowing(userId) ? '#fff' : colors.primary} />
      ) : (
        <>
          <Ionicons 
            name={isFollowing(userId) ? 'checkmark' : 'add'} 
            size={16} 
            color={isFollowing(userId) ? '#fff' : colors.primary} 
          />
          <Text style={[
            styles.buttonText,
            isFollowing(userId) && styles.followingText
          ]}>
            {isFollowing(userId) ? 'Following' : 'Follow'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  following: {
    backgroundColor: colors.primary,
  },
  notFollowing: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    marginLeft: 5,
    fontSize: 14,
    color: colors.primary,
  },
  followingText: {
    color: '#fff',
  },
});

export default FollowButton;