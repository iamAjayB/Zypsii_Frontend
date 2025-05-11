import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { base_url } from '../../utils/base_url';

const FollowContext = createContext();

export const FollowProvider = ({ children }) => {
  const [following, setFollowing] = useState([]);

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

  const toggleFollow = async (userId) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${base_url}/user/follow/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        const newFollowing = following.includes(userId)
          ? following.filter(id => id !== userId)
          : [...following, userId];
        
        setFollowing(newFollowing);
        await AsyncStorage.setItem('following', JSON.stringify(newFollowing));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  return (
    <FollowContext.Provider value={{ following, toggleFollow }}>
      {children}
    </FollowContext.Provider>
  );
};

export const useFollow = () => useContext(FollowContext);