import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { base_url } from '../../utils/base_url';

const FollowContext = createContext();

export const FollowProvider = ({ children }) => {
  const [following, setFollowing] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load followed users from storage when app starts
  useEffect(() => {
    const loadFollowing = async () => {
      try {
        const storedFollowing = await AsyncStorage.getItem('following');
        if (storedFollowing) {
          setFollowing(JSON.parse(storedFollowing));
        }
      } catch (error) {
        console.error('Error loading following data:', error);
      }
    };
    loadFollowing();
  }, []);

  const followUser = async (followerId, followingId) => {
    setIsLoading(true);
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(
        `${base_url}/follow/followUser/${followerId}/${followingId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );


      if (!response.ok) throw new Error('Failed to follow user');
    
      const data = await response.json();
      console.log("Follow response:", data);
            
      if (data.success) {
        setFollowing(prev => [...prev, followingId]);
        await AsyncStorage.setItem('following', JSON.stringify([...following, followingId]));
      }
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const unfollowUser = async (followerId, followingId) => {
    setIsLoading(true);
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(
        `${base_url}/follow/unfollowUser/${followerId}/${followingId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setFollowing(prev => prev.filter(id => id !== followingId));
        await AsyncStorage.setItem('following', JSON.stringify(following.filter(id => id !== followingId)));
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFollowing = (userId) => following.includes(userId);

  return (
    <FollowContext.Provider value={{ 
      following, 
      followUser, 
      unfollowUser, 
      isFollowing,
      isLoading 
    }}>
      {children}
    </FollowContext.Provider>
  );
};

export const useFollow = () => {
  const context = useContext(FollowContext);
  if (!context) {
    throw new Error('useFollow must be used within a FollowProvider');
  }
  return context;
};