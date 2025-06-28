import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ImageBackground,
  Alert,
  Modal,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons, Ionicons, Feather, AntDesign } from '@expo/vector-icons';
import { colors } from '../../utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { base_url } from '../../utils/base_url';
import { LinearGradient } from 'expo-linear-gradient';
import { TextDefault } from '../../components';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PostDetail = ({ route, navigation }) => {
  const { post } = route.params;
  const [showFullImage, setShowFullImage] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        setAccessToken(token);

        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setCurrentUser(user);
          
          // Check if current user is the post owner
          const postCreatedBy = post.createdBy || post.userId;
          const currentUserId = user._id || user.id;
          setIsOwner(postCreatedBy === currentUserId);
        }
      } catch (error) {
        console.error('Error fetching data from AsyncStorage:', error);
      }
    };

    fetchData();
  }, [post]);

  const handleDelete = async () => {
    if (!isOwner) {
      Alert.alert('Error', 'You can only delete your own posts');
      return;
    }

    const token = await AsyncStorage.getItem('accessToken');

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${base_url}/post/delete/${post.id}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              });
              
              if (response.ok) {
                Alert.alert('Success', 'Post deleted successfully');
                navigation.goBack();
              } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.message || 'Failed to delete post');
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Something went wrong. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.btncolor} />

      {/* Header with Zipsii Brand Colors */}
      <LinearGradient
        colors={[colors.btncolor, colors.Zypsii_color]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <TextDefault style={styles.headerTitle} textColor={colors.white} H4>
            Post Details
          </TextDefault>
          <View style={styles.headerActions}>
            {isOwner && (
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <MaterialIcons name="delete-outline" size={24} color={colors.white} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.shareButton}>
              <Feather name="share-2" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Main Image */}
        {post.imageUrl && post.imageUrl.length > 0 && (
          <TouchableOpacity 
            style={styles.imageContainer}
            onPress={() => setShowFullImage(true)}
            activeOpacity={0.9}
          >
            <Image 
              source={{ uri: post.imageUrl[0] }} 
              style={styles.postImage} 
              resizeMode="cover" 
            />
            <View style={styles.imageOverlay}>
              <View style={styles.playIconContainer}>
                <MaterialIcons name="zoom-in" size={32} color={colors.white} />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <TextDefault style={styles.title} textColor={colors.fontMainColor} H3>
              {post.postTitle}
            </TextDefault>
            <View style={styles.postTypeBadge}>
              <MaterialIcons 
                name={post.postType === 'Private' ? 'lock' : 'public'} 
                size={14} 
                color={colors.btncolor} 
              />
              <TextDefault style={styles.postTypeText} textColor={colors.btncolor} small>
                {post.postType || 'Public'}
              </TextDefault>
            </View>
          </View>

          {/* Enhanced Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <AntDesign name="heart" size={20} color="#e74c3c" />
              </View>
              <TextDefault style={styles.statText} textColor={colors.fontSecondColor}>
                {post.likes || '0'}
              </TextDefault>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="chat-bubble-outline" size={20} color="#3498db" />
              </View>
              <TextDefault style={styles.statText} textColor={colors.fontSecondColor}>
                {post.comments || '0'}
              </TextDefault>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="share" size={20} color="#2ecc71" />
              </View>
              <TextDefault style={styles.statText} textColor={colors.fontSecondColor}>
                {post.shares || '0'}
              </TextDefault>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <MaterialIcons name="visibility" size={20} color="#9b59b6" />
              </View>
              <TextDefault style={styles.statText} textColor={colors.fontSecondColor}>
                {post.views || '0'}
              </TextDefault>
            </View>
          </View>

          {/* Tags Section */}
          {post.tags && post.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <TextDefault style={styles.tagsTitle} textColor={colors.fontMainColor} H4>
                Tags
              </TextDefault>
              <View style={styles.tagsList}>
                {post.tags.map((tag, index) => (
                  <View key={index} style={styles.tagItem}>
                    <TextDefault style={styles.tagText} textColor={colors.btncolor} small>
                      #{tag}
                    </TextDefault>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Meta Information */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <MaterialIcons name="access-time" size={16} color={colors.fontThirdColor} />
              <TextDefault style={styles.metaText} textColor={colors.fontThirdColor} small>
                {formatDate(post.createdAt)}
              </TextDefault>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="person" size={16} color={colors.fontThirdColor} />
              <TextDefault style={styles.metaText} textColor={colors.fontThirdColor} small>
                {isOwner ? 'Your post' : 'Shared post'}
              </TextDefault>
            </View>
          </View>

          {/* Action Buttons */}
          {/* <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <AntDesign name="hearto" size={20} color={colors.fontSecondColor} />
              <TextDefault style={styles.actionButtonText} textColor={colors.fontSecondColor}>
                Like
              </TextDefault>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="chat-bubble-outline" size={20} color={colors.fontSecondColor} />
              <TextDefault style={styles.actionButtonText} textColor={colors.fontSecondColor}>
                Comment
              </TextDefault>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="share" size={20} color={colors.fontSecondColor} />
              <TextDefault style={styles.actionButtonText} textColor={colors.fontSecondColor}>
                Share
              </TextDefault>
            </TouchableOpacity>
          </View> */}
        </View>
      </ScrollView>

      {/* Enhanced Full Screen Image Modal */}
      <Modal
        visible={showFullImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullImage(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowFullImage(false)}
          >
            <Ionicons name="close" size={30} color={colors.white} />
          </TouchableOpacity>
          <Image
            source={{ uri: post.imageUrl?.[0] }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: StatusBar.currentHeight + 10,
    paddingHorizontal: 15,
  },
  backButton: { padding: 8 },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: 'bold',
    color: colors.white 
  },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  deleteButton: { padding: 8 },
  shareButton: { padding: 8 },
  scrollView: { flex: 1 },
  imageContainer: {
    width: screenWidth,
    height: screenWidth,
    position: 'relative',
  },
  postImage: { width: '100%', height: '100%' },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  contentContainer: {
    padding: 20,
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    flex: 1,
    marginRight: 10,
  },
  postTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightpink,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  postTypeText: {
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.lightHorizontalLine,
    marginBottom: 20,
    backgroundColor: colors.themeBackground,
    borderRadius: 12,
    marginHorizontal: -10,
    paddingHorizontal: 10,
  },
  statItem: { 
    flexDirection: 'row', 
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statIconContainer: {
    backgroundColor: colors.lightpink,
    padding: 8,
    borderRadius: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  tagsContainer: {
    marginBottom: 20,
  },
  tagsTitle: {
    marginBottom: 10,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagItem: {
    backgroundColor: colors.lightpink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontWeight: '500',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderColor: colors.lightHorizontalLine,
    marginTop: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.themeBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  metaText: {
    marginLeft: 6,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: colors.lightHorizontalLine,
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.themeBackground,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
});

export default PostDetail;
