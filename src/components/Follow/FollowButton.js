import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFollow } from './FollowContext';
import { colors } from '../../utils';
import { Ionicons } from '@expo/vector-icons';

const FollowButton = ({ userId, style }) => {
  const { following, toggleFollow } = useFollow();
  const [isLoading, setIsLoading] = React.useState(false);
  
  const isFollowing = following.includes(userId);

  const handlePress = async () => {
    setIsLoading(true);
    await toggleFollow(userId);
    setIsLoading(false);
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isFollowing ? styles.following : styles.notFollowing,
        style
      ]}
      onPress={handlePress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={isFollowing ? '#fff' : colors.Zypsii_color} />
      ) : (
        <>
          <Ionicons 
            name={isFollowing ? 'checkmark' : 'add'} 
            size={16} 
            color={isFollowing ? '#fff' : colors.Zypsii_color} 
          />
          <Text style={[styles.buttonText, isFollowing && styles.followingText]}>
            {isFollowing ? 'Following' : 'Follow'}
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
    gap: 4
  },
  following: {
    backgroundColor: colors.Zypsii_color,
    borderColor: colors.Zypsii_color,
  },
  notFollowing: {
    backgroundColor: 'transparent',
    borderColor: colors.Zypsii_color,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  followingText: {
    color: '#fff',
  },
});

export default FollowButton;