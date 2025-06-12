import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Text,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import SwiperFlatList from 'react-native-swiper-flatlist';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import { TextDefault } from '../../components';
import { colors } from '../../utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { base_url } from '../../utils/base_url';
import FollowButton from '../../components/Follow/FollowButton';
import io from 'socket.io-client';
import { SOCKET_URL } from '../../config';

const { height, width } = Dimensions.get('window');

function ShortsScreen() {
  const [all_shorts, setAllShorts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [isCommenting, setIsCommenting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [selectedShort, setSelectedShort] = useState(null);
  const [likes, setLikes] = useState({});
  const [isLiking, setIsLiking] = useState({});
  const [shareCounts, setShareCounts] = useState({});
  const socketRef = useRef(null);
  const isRoomJoined = useRef({});
  const isCommentRoomJoined = useRef({});
  const isShareRoomJoined = useRef({});

  const fetchShorts = async () => {
    try {
      setIsLoading(true);
      const accessToken = await AsyncStorage.getItem('accessToken');
      
      // Fetch shorts
      const shortsResponse = await fetch(`${base_url}/shorts/listing`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!shortsResponse.ok) {
        throw new Error(`API request failed with status ${shortsResponse.status}`);
      }

      const shortsData = await shortsResponse.json();
      console.log('Shorts API Response:', shortsData); // Debug log
      
      if (shortsData.status && Array.isArray(shortsData.data)) {
        const shortsList = shortsData.data.map(short => {
          console.log('Short createdBy data:', short.createdBy); // Debug log
          return {
            _id: short._id,
            type: 'short',
            title: short.title,
            description: short.description,
            videoUrl: short.videoUrl,
            thumbnailUrl: short.thumbnailUrl,
            createdBy: {
              _id: short.createdBy?._id,
              username: short.createdBy?.userName || short.createdBy?.username,
              fullName: short.createdBy?.fullName || short.createdBy?.name,
              profilePicture: short.createdBy?.profilePicture || short.createdBy?.profileImage
            },
            viewsCount: short.viewsCount || 0,
            likesCount: short.likesCount || 0,
            commentsCount: short.commentsCount || 0,
            createdAt: short.createdAt,
            updatedAt: short.updatedAt
          };
        });
        
        // Filter only mp4 videos
        const mp4ShortsList = shortsList.filter(
          item => typeof item.videoUrl === 'string' && item.videoUrl.toLowerCase().endsWith('.mp4')
        );
        setAllShorts(mp4ShortsList);
      } else {
        setAllShorts([]);
      }
    } catch (error) {
      console.error('Error fetching shorts:', error);
      setAllShorts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShorts();

    const getCurrentUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem('user');
        if (userId) {
          const userData = JSON.parse(userId);
          setCurrentUserId(userData._id);
        }
      } catch (error) {
        console.error('Error getting user ID:', error);
      }
    };
    getCurrentUserId();

    // Initialize socket connection
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL);

      socketRef.current.on('connect', () => {
        console.log('Socket connected:', socketRef.current.id);
        setupSocketListeners();
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }

    return () => {
      if (socketRef.current) {
        // Leave all rooms
        Object.keys(isRoomJoined.current).forEach(shortId => {
          leaveLikeRoom(shortId);
        });
        Object.keys(isCommentRoomJoined.current).forEach(shortId => {
          leaveCommentRoom(shortId);
        });
        Object.keys(isShareRoomJoined.current).forEach(shortId => {
          leaveShareRoom(shortId);
        });
        socketRef.current.removeAllListeners();
      }
    };
  }, []);

  const setupSocketListeners = () => {
    if (!socketRef.current) return;

    // Like-related listeners
    socketRef.current.on('join-like-room-status', (data) => {
      console.log('Join like room status:', data);
      if (data.moduleId) {
        isRoomJoined.current[data.moduleId] = true;
        requestLikeCount(data.moduleId);
      }
    });

    socketRef.current.on('leave-like-room-status', (data) => {
      console.log('Leave like room status:', data);
      if (data.moduleId) {
        isRoomJoined.current[data.moduleId] = false;
      }
    });

    socketRef.current.on('like-count-status', (data) => {
      console.log('Like count status:', data);
      if (data.moduleId) {
        setAllShorts(prevShorts => 
          prevShorts.map(short => 
            short._id === data.moduleId 
              ? { ...short, likesCount: data.likeCount }
              : short
          )
        );
      }
    });

    socketRef.current.on('like-status', (data) => {
      console.log('Like status received:', data);
      if (data.moduleId) {
        // Update likes state based on success
        setLikes(prev => ({
          ...prev,
          [data.moduleId]: data.success === true
        }));
        
        // Update like count in all_shorts
        setAllShorts(prevShorts => 
          prevShorts.map(short => 
            short._id === data.moduleId 
              ? { 
                  ...short, 
                  likesCount: data.success 
                    ? (short.likesCount || 0) + 1 
                    : Math.max((short.likesCount || 0) - 1, 0)
                }
              : short
          )
        );
        
        setIsLiking(prev => ({
          ...prev,
          [data.moduleId]: false
        }));
      }
    });

    // Comment-related listeners
    socketRef.current.on('join-comment-room-status', (data) => {
      console.log('Join comment room status:', data);
      if (data.moduleId) {
        isCommentRoomJoined.current[data.moduleId] = true;
      }
    });

    socketRef.current.on('leave-comment-room-status', (data) => {
      console.log('Leave comment room status:', data);
      if (data.moduleId) {
        isCommentRoomJoined.current[data.moduleId] = false;
      }
    });

    socketRef.current.on('comment-status', (data) => {
      console.log('Comment status received:', data);
      if (data.comment) {
        setComments(prevComments => [data.comment, ...prevComments]);
        setCommentText('');
        setIsCommenting(false);
      }
    });

    socketRef.current.on('comment-list', (data) => {
      console.log('Comment list received:', data);
      if (data.comments) {
        setComments(data.comments);
      }
    });

    socketRef.current.on('comment-error', (error) => {
      console.error('Comment error:', error);
      setIsCommenting(false);
      Alert.alert('Error', error.message || 'Failed to add comment');
    });

    socketRef.current.on('comment-deleted', (data) => {
      console.log('Comment deleted:', data);
      if (data.success) {
        // Remove the deleted comment from the list
        setComments(prevComments => 
          prevComments.filter(comment => comment._id !== data.commentId)
        );
        
        // Update comments count in all_shorts
        setAllShorts(prevShorts => 
          prevShorts.map(short => 
            short._id === selectedShort._id 
              ? { ...short, commentsCount: Math.max((short.commentsCount || 0) - 1, 0) }
              : short
          )
        );

        // Refresh the comment list
        handleListComments(selectedShort._id);
      }
    });

    socketRef.current.on('comment-delete-error', (error) => {
      console.error('Comment delete error:', error);
      Alert.alert('Error', error.message || 'Failed to delete comment');
    });

    // Share-related listeners
    socketRef.current.on('join-share-room-status', (data) => {
      if (data.moduleId) {
        isShareRoomJoined.current[data.moduleId] = true;
        requestShareCount(data.moduleId);
      }
    });

    socketRef.current.on('share-count', (data) => {
      if (data.moduleId) {
        setShareCounts(prev => ({
          ...prev,
          [data.moduleId]: data.count
        }));
      }
    });
  };

  const joinLikeRoom = (shortId) => {
    if (socketRef.current && !isRoomJoined.current[shortId]) {
      console.log('Joining like room for short:', shortId);
      socketRef.current.emit('join-like-room', {
        moduleId: shortId,
        moduleType: 'shorts'
      });
    }
  };

  const leaveLikeRoom = (shortId) => {
    if (socketRef.current && isRoomJoined.current[shortId]) {
      console.log('Leaving like room for short:', shortId);
      socketRef.current.emit('leave-like-room', {
        moduleId: shortId,
        moduleType: 'shorts'
      });
    }
  };

  const joinCommentRoom = (shortId) => {
    if (socketRef.current && !isCommentRoomJoined.current[shortId]) {
      console.log('Joining comment room for short:', shortId);
      socketRef.current.emit('join-comment-room', {
        moduleId: shortId,
        moduleType: 'shorts'
      });
    }
  };

  const leaveCommentRoom = (shortId) => {
    if (socketRef.current && isCommentRoomJoined.current[shortId]) {
      console.log('Leaving comment room for short:', shortId);
      socketRef.current.emit('leave-comment-room', {
        moduleId: shortId,
        moduleType: 'shorts'
      });
    }
  };

  const joinShareRoom = (shortId) => {
    if (socketRef.current && !isShareRoomJoined.current[shortId]) {
      socketRef.current.emit('join-share-room', {
        moduleId: shortId,
        moduleType: 'short'
      });
    }
  };

  const leaveShareRoom = (shortId) => {
    if (socketRef.current && isShareRoomJoined.current[shortId]) {
      socketRef.current.emit('leave-share-room', {
        moduleId: shortId,
        moduleType: 'short'
      });
    }
  };

  const requestLikeCount = (shortId) => {
    if (socketRef.current) {
      console.log('Requesting like count for short:', shortId);
      socketRef.current.emit('like-count', {
        moduleType: 'shorts',
        moduleId: shortId
      });
    }
  };

  const requestShareCount = (shortId) => {
    if (socketRef.current) {
      socketRef.current.emit('share-count', {
        moduleType: 'short',
        moduleId: shortId
      });
    }
  };

  const handleLike = async (short) => {
    if (!currentUserId) {
      Alert.alert('Error', 'Please login to like shorts');
      return;
    }

    if (!short || !short._id) {
      console.error('Invalid short object:', short);
      return;
    }

    if (isLiking[short._id]) {
      return;
    }

    try {
      setIsLiking(prev => ({ ...prev, [short._id]: true }));
      joinLikeRoom(short._id);

      const payload = {
        likedBy: currentUserId,
        moduleType: 'shorts',
        moduleId: short._id,
        moduleCreatedBy: short.createdBy
      };

      // Optimistically update the UI
      setLikes(prev => ({
        ...prev,
        [short._id]: !likes[short._id]
      }));

      if (likes[short._id]) {
        console.log('Unliking short:', short._id);
        socketRef.current.emit('unlike', payload);
      } else {
        console.log('Liking short:', short._id);
        socketRef.current.emit('like', payload);
      }
    } catch (error) {
      console.error('Like/Unlike Error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
      // Revert optimistic update on error
      setLikes(prev => ({
        ...prev,
        [short._id]: !prev[short._id]
      }));
      setIsLiking(prev => ({ ...prev, [short._id]: false }));
    }
  };

  const handleComment = (short) => {
    console.log('Opening comment modal for short:', short);
    setSelectedShort(short);
    setShowCommentModal(true);
    joinCommentRoom(short._id);
    handleListComments(short._id);
  };

  const handleCommentSubmit = async () => {
    if (!currentUserId) {
      Alert.alert('Login Required', 'Please login to comment');
      return;
    }

    if (!commentText.trim()) {
      Alert.alert('Error', 'Comment cannot be empty');
      return;
    }

    if (isCommenting) {
      return;
    }

    try {
      setIsCommenting(true);
      console.log('Submitting comment for short:', selectedShort._id);

      // Prepare the comment payload matching backend structure
      const commentPayload = {
        moduleId: selectedShort._id,
        moduleType: 'shorts',
        moduleCreatedBy: selectedShort.createdBy,
        commentedBy: currentUserId,
        commentDataValue: commentText.trim()
      };

      console.log('Sending comment payload:', commentPayload);

      // Send the comment
      socketRef.current.emit('comment', commentPayload);

      // Clear the comment text immediately
      setCommentText('');

      // Set a timeout to reset commenting state if it takes too long
      setTimeout(() => {
        if (isCommenting) {
          setIsCommenting(false);
          Alert.alert('Error', 'Comment submission timed out. Please try again.');
        }
      }, 5000);

    } catch (error) {
      console.error('Error submitting comment:', error);
      setIsCommenting(false);
      Alert.alert('Error', 'Failed to submit comment. Please try again.');
    }
  };

  const handleListComments = (shortId) => {
    if (socketRef.current && shortId) {
      console.log('Requesting comments for short:', shortId);
      socketRef.current.emit('list-comment', {
        moduleId: shortId,
        moduleType: 'shorts'
      });
    }
  };

  const handleShare = async (short) => {
    if (!currentUserId) {
      Alert.alert('Error', 'Please login to share shorts');
      return;
    }
    setSelectedShort(short);
    setShowShareModal(true);
    await fetchFollowers();
    joinShareRoom(short._id);
  };

  const fetchFollowers = async () => {
    try {
      setIsLoadingFollowers(true);
      const token = await AsyncStorage.getItem('accessToken');

      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      const response = await fetch(`${base_url}/follow/getFollowers/${currentUserId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.status) {
        setFollowers(data.followers);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch followers');
      }
    } catch (error) {
      console.error('Fetch Followers Error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsLoadingFollowers(false);
    }
  };

  const handleShareWithFollower = (follower) => {
    if (!currentUserId) {
      Alert.alert('Error', 'Please login to share shorts');
      return;
    }

    socketRef.current.emit('share', {
      moduleId: selectedShort._id,
      moduleType: 'short',
      moduleCreatedBy: selectedShort.createdBy,
      sharedBy: currentUserId
    });

    setShowShareModal(false);
    Alert.alert('Success', 'Short shared successfully');
  };

  const renderCommentItem = ({ item: comment }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <View style={styles.commentUserInfo}>
          <Image
            source={{
              uri: comment.commentedBy?.profilePicture || 'https://via.placeholder.com/40'
            }}
            style={styles.commentUserImage}
          />
          <View style={styles.commentUserDetails}>
            <Text style={styles.commentUser}>
              {comment.commentedBy?.fullName || comment.commentedBy?.username}
            </Text>
            <Text style={styles.commentDate}>
              {new Date(comment.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.commentText}>{comment.commentData}</Text>
    </View>
  );

  const renderFollowerItem = ({ item: follower }) => (
    <TouchableOpacity
      style={styles.followerItem}
      onPress={() => handleShareWithFollower(follower)}
    >
      <Image
        source={{
          uri: follower.profilePicture || 'https://via.placeholder.com/50'
        }}
        style={styles.followerImage}
      />
      <View style={styles.followerInfo}>
        <Text style={styles.followerName}>{follower.fullName}</Text>
        <Text style={styles.followerUsername}>{follower.userName}</Text>
      </View>
    </TouchableOpacity>
  );

  const isValidVideoUrl = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.mov', '.webm', '.m4v'];
    const isSupportedFormat = videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
    const isHttpUrl = url.startsWith('http');
    const isHttpsUrl = url.startsWith('https');
    
    return (isSupportedFormat || isHttpUrl || isHttpsUrl) && !url.toLowerCase().endsWith('.3gp');
  };

  const getVideoSource = (videoUrl) => {
    if (!videoUrl) return null;
    if (videoUrl.toLowerCase().endsWith('.3gp')) return null;
    
    if (videoUrl.startsWith('http') || videoUrl.startsWith('https')) {
      return { uri: videoUrl };
    } else if (videoUrl.startsWith('file://')) {
      return { uri: videoUrl };
    } else if (videoUrl.startsWith('data:')) {
      return { uri: videoUrl };
    }
    return null;
  };

  const renderInteractionButtons = (item) => (
    <View style={styles.interactionButtonsContainer}>
      <TouchableOpacity
        style={styles.interactionButton}
        onPress={() => handleLike(item)}
        disabled={isLiking[item._id]}
      >
        <AntDesign
          name={likes[item._id] ? 'heart' : 'hearto'}
          size={24}
          color={likes[item._id] ? '#FF0000' : 'white'}
          style={{ opacity: isLiking[item._id] ? 0.5 : 1 }}
        />
        <Text style={styles.interactionCount}>{item.likesCount || 0}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.interactionButton}
        onPress={() => handleComment(item)}
      >
        <Icon name="chatbubble-outline" size={24} color="white" />
        <Text style={styles.interactionCount}>{item.commentsCount || 0}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.interactionButton}
        onPress={() => handleShare(item)}
      >
        <Feather name="navigation" size={24} color="white" />
        <Text style={styles.interactionCount}>{shareCounts[item._id] || 0}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderShortInfo = (item) => {
    console.log('Rendering short info for item:', item); // Debug log
    return (
      <View style={styles.shortInfoContainer}>
        <View style={styles.userInfoContainer}>
          <Image
            source={{
              uri: item.createdBy?.profilePicture || 'https://via.placeholder.com/40'
            }}
            style={styles.userProfileImage}
          />
          <View style={styles.userDetails}>
            <Text style={styles.username}>
              {item.createdBy?.userName || item.createdBy?.username || 'Unknown User'}
            </Text>
          </View>
          <View style={styles.followButtonContainer}>
            <FollowButton userId={item.createdBy?._id} style={styles.followButton} />
          </View>
        </View>
        <View style={styles.shortDetails}>
          <Text style={styles.shortTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.shortDescription} numberOfLines={2}>{item.description}</Text>
        </View>
      </View>
    );
  };

  // Add checkLikeStatus function
  const checkLikeStatus = async (shortId) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(
        `${base_url}/like-status?moduleType=shorts&moduleId=${shortId}&moduleCreatedBy=${currentUserId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      console.log('Like status check response:', data);
      
      if (response.ok && data.success !== undefined) {
        setLikes(prev => ({
          ...prev,
          [shortId]: data.success
        }));
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  // Update useEffect to check like status when shorts are loaded
  useEffect(() => {
    if (all_shorts.length > 0 && currentUserId) {
      all_shorts.forEach(short => {
        checkLikeStatus(short._id);
      });
    }
  }, [all_shorts, currentUserId]);

  // Update handleDeleteComment to match Post.js implementation
  const handleDeleteComment = (commentId) => {
    if (!currentUserId) {
      Alert.alert('Error', 'Please login to delete comments');
      return;
    }

    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (socketRef.current) {
              console.log('Deleting comment:', commentId);
              socketRef.current.emit('delete-comment', {
                commentId,
                commentedBy: currentUserId,
                moduleId: selectedShort._id,
                moduleType: 'shorts'
              });
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.btncolor} />
      </View>
    );
  }

  if (!all_shorts || all_shorts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="videocam-outline" size={48} color={colors.fontSecondColor} />
        <TextDefault textColor={colors.fontMainColor} H5 style={{ marginTop: 10 }}>
          No shorts available
        </TextDefault>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SwiperFlatList
        data={all_shorts}
        keyExtractor={(item) => item._id}
        vertical
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        decelerationRate="fast"
        onChangeIndex={({ index }) => {
          const stopVideoScript = `
            var videos = document.getElementsByTagName('video');
            for(var i = 0; i < videos.length; i++) {
              videos[i].pause();
              videos[i].currentTime = 0;
            }
          `;
          if (this.webview) {
            this.webview.injectJavaScript(stopVideoScript);
          }
        }}
        renderItem={({ item }) => {
          const videoSource = getVideoSource(item.videoUrl);
          const isValidVideo = isValidVideoUrl(item.videoUrl);
          
          return (
            <View style={styles.shortItemContainer}>
              <View style={styles.videoContainer}>
                {isValidVideo && videoSource ? (
                  <View style={styles.videoWrapper}>
                    <WebView
                      ref={(ref) => (this.webview = ref)}
                      source={videoSource}
                      style={[styles.videoPlayer, { width: width, height: height }]}
                      allowsFullscreenVideo={true}
                      javaScriptEnabled={true}
                      domStorageEnabled={true}
                      startInLoadingState={true}
                      mediaPlaybackRequiresUserAction={false}
                      allowsInlineMediaPlayback={true}
                      onLoad={() => {
                        const autoPlayScript = `
                          var video = document.createElement('video');
                          video.src = '${videoSource.uri}';
                          video.style.width = '100%';
                          video.style.height = '100%';
                          video.style.objectFit = 'cover';
                          video.loop = true;
                          video.muted = false;
                          video.playsInline = true;
                          video.autoplay = true;
                          video.setAttribute('loop', true);
                          video.setAttribute('playsinline', true);
                          video.setAttribute('webkit-playsinline', true);
                          video.setAttribute('x5-playsinline', true);
                          video.setAttribute('x5-video-player-type', 'h5');
                          video.setAttribute('x5-video-player-fullscreen', true);
                          video.setAttribute('x5-video-orientation', 'portraint');
                          video.removeAttribute('controls');
                          
                          document.body.style.margin = '0';
                          document.body.style.padding = '0';
                          document.body.style.overflow = 'hidden';
                          document.body.style.backgroundColor = 'black';
                          document.body.appendChild(video);
                          
                          video.play().catch(function(error) {
                            console.log("Initial playback failed:", error);
                          });
                          
                          video.addEventListener('ended', function() {
                            video.currentTime = 0;
                            video.play().catch(function(error) {
                              console.log("Playback failed:", error);
                            });
                          });
                        `;
                        this.webview.injectJavaScript(autoPlayScript);
                      }}
                    />
                  </View>
                ) : (
                  <View style={styles.errorContainer}>
                    <Icon name="alert-circle-outline" size={48} color={colors.fontSecondColor} />
                    <TextDefault textColor={colors.fontMainColor} H5 style={{ marginTop: 10 }}>
                      Invalid video format
                    </TextDefault>
                  </View>
                )}

                {renderShortInfo(item)}
                {renderInteractionButtons(item)}
              </View>
            </View>
          );
        }}
      />

      {/* Comment Modal */}
      <Modal
        visible={showCommentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCommentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowCommentModal(false)}
          />
          <View style={styles.commentModalContainer}>
            <View style={styles.modalHandle} />
            <View style={styles.commentModalContent}>
              <View style={styles.commentInputContainer}>
                <TextInput
                  placeholder="Add a comment..."
                  style={styles.commentInput}
                  multiline
                  value={commentText}
                  onChangeText={setCommentText}
                  maxLength={500}
                  editable={!isCommenting}
                />
                <TouchableOpacity
                  style={[
                    styles.commentSubmitButton,
                    { 
                      opacity: commentText.trim() && !isCommenting ? 1 : 0.5,
                      backgroundColor: isCommenting ? '#ccc' : '#A60F93'
                    }
                  ]}
                  onPress={handleCommentSubmit}
                  disabled={isCommenting || !commentText.trim()}
                >
                  <Text style={styles.commentSubmitText}>
                    {isCommenting ? 'Posting...' : 'Post'}
                  </Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={comments}
                keyExtractor={(comment) => comment._id}
                renderItem={({ item: comment }) => (
                  <View style={styles.commentItem}>
                    <View style={styles.commentHeader}>
                      <View style={styles.commentUserInfo}>
                        <Image
                          source={{
                            uri: comment.commentedBy?.profilePicture || 'https://via.placeholder.com/40'
                          }}
                          style={styles.commentUserImage}
                        />
                        <View style={styles.commentUserDetails}>
                          <Text style={styles.commentUser}>
                            {comment.commentedBy?.fullName || comment.commentedBy?.username}
                          </Text>
                          <Text style={styles.commentDate}>
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                      {comment.commentedBy?._id === currentUserId && (
                        <TouchableOpacity
                          onPress={() => handleDeleteComment(comment._id)}
                          style={styles.deleteCommentButton}
                        >
                          <Feather name="trash-2" size={16} color="#FF3B30" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={styles.commentText}>{comment.commentData}</Text>
                  </View>
                )}
                style={styles.commentsList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Share Modal */}
      <Modal
        visible={showShareModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowShareModal(false)}
          />
          <View style={styles.shareModalContainer}>
            <View style={styles.modalHandle} />
            <Text style={styles.shareModalTitle}>Share with followers</Text>
            {isLoadingFollowers ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.btncolor} />
              </View>
            ) : (
              <FlatList
                data={followers}
                keyExtractor={(item) => item._id}
                renderItem={renderFollowerItem}
                style={styles.followersList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.black,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.black,
  },
  shortItemContainer: {
    width: width,
    height: height,
    backgroundColor: colors.black,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: colors.black,
  },
  videoWrapper: {
    flex: 1,
    backgroundColor: colors.black,
  },
  videoPlayer: {
    flex: 1,
    backgroundColor: colors.black,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.black,
  },
  interactionButtonsContainer: {
    position: 'absolute',
    right: 10,
    bottom: 100,
    alignItems: 'center',
  },
  interactionButton: {
    alignItems: 'center',
    marginVertical: 10,
  },
  interactionCount: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 15,
  },
  commentModalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '60%',
    maxHeight: '80%',
  },
  commentModalContent: {
    flex: 1,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
  },
  commentSubmitButton: {
    backgroundColor: colors.btncolor,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  commentSubmitText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  commentsList: {
    flex: 1,
  },
  commentItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  commentUserImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentUserDetails: {
    flex: 1,
  },
  commentUser: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  commentText: {
    color: '#333',
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 50,
  },
  commentDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  shareModalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '60%',
    maxHeight: '80%',
  },
  shareModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  followersList: {
    flex: 1,
  },
  followerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  followerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  followerInfo: {
    flex: 1,
  },
  followerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  followerUsername: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  shortInfoContainer: {
    position: 'absolute',
    left: 10,
    top: 40,
    right: 60,
    zIndex: 1,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingRight: 10,
  },
  userProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userDetails: {
    flex: 1,
    marginRight: 10,
  },
  username: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  followButtonContainer: {
    marginLeft: 'auto',
  },
  followButton: {
    minWidth: 80,
    height: 30,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  shortDetails: {
    marginTop: 8,
  },
  shortTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  shortDescription: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  deleteCommentButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 5,
  },
});

export default ShortsScreen; 