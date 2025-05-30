import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, KeyboardAvoidingView, ScrollView, Platform, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location'; // Use expo-location
import { base_url } from '../../utils/base_url';

const SignUpScreen = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const navigation = useNavigation();

  // Request location permission and fetch location
  const getLocation = async () => {
    try {
      // Request permission for location access
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        console.log(location);

        setLatitude(location.coords.latitude);
        setLongitude(location.coords.longitude);
      } else {
        Alert.alert('Permission Denied', 'Location permission is required');
      }
    } catch (error) {
      console.warn('Error fetching location:', error);
      Alert.alert('Error', 'Unable to fetch location');
    }
  };

  useEffect(() => {
    getLocation(); // Fetch location when the component mounts
  }, []);

  const handleSignUp = async () => {
    if (!email || !password || !fullName || latitude === null || longitude === null) {
      Alert.alert('Error', 'Please enter all fields and allow location access');
      return;
    }

    setLoading(true);
    try {
      console.log('Sending signup request to:', `${base_url}/user/signUp`);
      const response = await fetch(`${base_url}/user/signUp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, password, latitude, longitude }),
      });

      if (response.ok) {
        const data = await response.json();
        if (!data.error) {
          Alert.alert('Success', 'Account created successfully');
          // const { accessToken, user } = data;
          // await AsyncStorage.setItem('accessToken', accessToken);
          // await AsyncStorage.setItem('user', JSON.stringify(user));

          navigation.navigate('Login');
        } else {
          Alert.alert('Error', data.message || 'Signup failed');
        }
      } else {
        Alert.alert('Error', 'Signup failed, please try again.');
      }
    } catch (error) {
      console.error('Network or fetch error:', error); // Log error
      Alert.alert('Error', 'Signup failed due to a network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.topSection}>
          <Text style={styles.title}>Sign Up</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginButtonText}>LOGIN</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
              <Text style={styles.signupButtonText}>SIGNUP</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.orText}>or signup with</Text>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity>
              <Image source={require('../../assets/icons/google.png')} style={styles.socialIcon} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image source={require('../../assets/icons/facebook.png')} style={styles.socialIcon} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Already have an account? <Text style={styles.loginLink}>LOGIN</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a60f93',
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: Dimensions.get('window').height,
  },
  topSection: {
    flex: 1,
    backgroundColor: '#a60f93',
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 30,
  },
  bottomSection: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
  },
  label: {
    color: '#FFFFFF',
    marginBottom: 8,
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 25,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  loginButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#a60f93',
  },
  signupButton: {
    flex: 1,
    backgroundColor: '#a60f93',
    paddingVertical: 15,
    borderRadius: 25,
    marginLeft: 10,
  },
  loginButtonText: {
    color: '#a60f93',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orText: {
    color: '#999',
    textAlign: 'center',
    marginVertical: 20,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  socialIcon: {
    width: 40,
    height: 40,
    marginHorizontal: 15,
  },
  loginText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 14,
  },
  loginLink: {
    color: '#000000',
    fontWeight: 'bold',
  },
});

export default SignUpScreen;
