import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import styles from './styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import { colors } from '../../utils';
import { Feather, MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Post from '../../components/Posts/Post';
import Schedule from '../MySchedule/Schedule/AllSchedule';
import { base_url } from '../../utils/base_url';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DummyScreen = ({ navigation }) => {
  const [activeIcon, setActiveIcon] = useState('th-large'); // Default active icon
  const [profileInfo, setProfileInfo] = useState({
    id: '',
    name: '',
    Posts: '0',
    Followers: '0',
    Following: '0',
    image: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [all_schedule, setAll_schedule] = useState([]);
  const [all_posts, setAllPosts] = useState([]);
  const [all_shorts, setAllShorts] = useState([]);

  // Fetch data from your API
  useEffect(() => {
    const fetchProfileInfo = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error('No access token found');
        }

        const response = await fetch(`${base_url}/user/getProfile`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success && result.data && result.data.length > 0) {
          const userData = result.data[0];
          setProfileInfo({
            id: userData.id || '',
            name: userData.fullName || '',
            Posts: userData.posts || '0',
            Followers: userData.followers || '0',
            Following: userData.following || '0',
            image: userData.profileImage || '',
            notes: userData.bio || ''
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Keep the default profile data in case of error
      } finally {
        setLoading(false);
      }
    };

    fetchProfileInfo();
  }, []);

  useEffect(() => {
    const fetch_all_schedule = async () => {
      try {
        const response = await fetch(baseUrl + '/get_all_schedule');
        const data = await response.json();
        const formattedData = data.slice(0, 100).map((item) => ({
          id: item.id,
          title: item.title,
          from: item.from,
          to: item.to,
          date: item.date,
          riders: item.riders,
          joined: item.joined,
          imageUrl: item.imageUrl,
          day1Locations: item.day1Locations,
          day2Locations: item.day2Locations,
        }));
        setAll_schedule(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetch_all_schedule();
  }, []);

  useEffect(() => {
    const fetch_all_posts = async () => {
      try {
        const response = await fetch(baseUrl + '/get_all_posts');
        const data = await response.json();
        const formattedData = data.slice(0, 100).map(item => ({
          id: item.id,
          postPersonImage: item.postPersonImage,
          postTitle: item.postTitle,
          postImage: item.postImage,
          likes: item.likes,
          isLiked: item.isLiked,
        }));
        setAllPosts(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetch_all_posts();
  }, []);

  useEffect(() => {
    const fetch_all_Shorts = async () => {
      try {
        const response = await fetch(baseUrl + '/get_all_shorts');
        const data = await response.json();
        const formattedData = data.slice(0, 100).map(item => ({
          id: item.id,
          video: item.video.url,
          videoTitle: item.videoTitle,
          videoImage: item.videoImage,
          likes: item.likes,
          isLiked: item.isLiked,
        }));
        setAllShorts(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetch_all_Shorts();
  }, []);

  // Handle card press for schedule items
  const handleCardPress = (item) => {
    console.log('Card pressed:', item);
    // Add navigation or detail view logic here
  };

  // Local images for grid view (th-large)
  const images = {
    'th-large': [
      { id: '1', uri: require('../../assets/image1.jpg') },
      { id: '2', uri: require('../../assets/image2.jpg') },
      { id: '3', uri: require('../../assets/image3.jpg') },
      { id: '4', uri: require('../../assets/image4.jpg') },
    ],
  };

  // Generate placeholders if no images are available
  const getImageData = () => {
    return images['th-large'].length > 0
      ? images['th-large']
      : Array(6)
          .fill(null)
          .map((_, index) => ({ id: `${index + 1}`, isPlaceholder: true }));
  };

  // Render content based on active icon
  const renderContent = () => {
    switch (activeIcon) {
      case 'th-large':
        return (
          <FlatList
            data={all_posts}
            renderItem={({ item }) => (
              <Post
                postPersonImage={item.postPersonImage}
                postTitle={item.postTitle}
                postImage={item.postImage}
                likes={item.likes}
                isLiked={item.isLiked}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        );
      case 'briefcase':
        return (
          <FlatList
          vertical
          showsVerticalScrollIndicator={false}
            data={all_schedule}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Schedule
              item={item} 
              />
            )}
          />
        );
      case 'play-circle':
        return (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={all_shorts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={videoStyles.videoContainer}>
                <WebView
                  source={{ uri: item.video }}
                  style={videoStyles.webviewVideo}
                  allowsFullscreenVideo
                />
                <Text style={videoStyles.videoTitle}>{item.videoTitle}</Text>
              </View>
            )}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.protractorShape} />
      <View style={styles.backgroundCurvedContainer} />
      {/* Header Section */}
      <View style={styles.header}>
        {/* Icons Row */}
        <View style={styles.topIconsRow}>
          <View style={styles.circle}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Profile Section */}
      <TouchableOpacity
        style={styles.profileContainer}
        onPress={() => navigation.navigate('PageCreation')}
      >
        <Image
          source={{uri:profileInfo.image}} // Local profile image
          style={styles.profileImage}
        />
        <Text style={styles.name}>{profileInfo.name || 'Jenish'}</Text>
        <Text style={styles.description}>{profileInfo.notes}</Text>
      </TouchableOpacity>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Posts</Text>
          <Text style={styles.statNumber}>{profileInfo.Posts || '0'}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Followers</Text>
          <Text style={styles.statNumber}>{profileInfo.Followers || '0'}</Text>
        </View>
        <View style={styles.statLast}>
          <Text style={styles.statLabel}>Following</Text>
          <Text style={styles.statNumber}>{profileInfo.Following || '0'}</Text>
        </View>
      </View>

      {/* Buttons Section */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.editProfileButton}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.buttonText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Gray Line */}
      <View style={styles.separatorLine} />

      {/* Icons Section */}
      <View style={styles.iconsContainer}>
        <TouchableOpacity
          style={[
            styles.iconBox,
            activeIcon === 'th-large' && styles.activeIconBox,
          ]}
          onPress={() => setActiveIcon('th-large')}
        >
          <Icon name="th-large" size={30} color="#870E6B" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.iconBox,
            activeIcon === 'briefcase' && styles.activeIconBox,
          ]}
          onPress={() => setActiveIcon('briefcase')}
        >
          <Icon name="briefcase" size={30} color="#870E6B" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.iconBox,
            activeIcon === 'play-circle' && styles.activeIconBox,
          ]}
          onPress={() => setActiveIcon('play-circle')}
        >
          <Icon name="play-circle" size={30} color="#870E6B" />
        </TouchableOpacity>
      </View>

      {/* Content Section based on active icon */}
      <View style={contentStyles.contentContainer}>
        {renderContent()}
      </View>
    </View>
  );
};

// Additional styles needed for the content sections
const contentStyles = {
  contentContainer: {
    flex: 1,
    marginTop: 10,
    zIndex: 2,
    paddingHorizontal: 5,
  },
};

// Styles for schedule cards
const cardStyles = {
  card: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  routeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  routeItem: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  routeText: {
    fontSize: 14,
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    marginBottom: 4,
  },
  riders: {
    fontSize: 14,
    color: '#666',
  },
  joinedButton: {
    backgroundColor: '#870E6B',
    padding: 8,
    alignItems: 'center',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  joinedText: {
    color: 'white',
    fontWeight: 'bold',
  },
};

// Styles for video/shorts
const videoStyles = {
  videoContainer: {
    width: 300,
    height: 200,
    marginHorizontal: 10,
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  webviewVideo: {
    width: '100%',
    height: 180,
  },
  videoTitle: {
    padding: 8,
    backgroundColor: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
};

export default DummyScreen;