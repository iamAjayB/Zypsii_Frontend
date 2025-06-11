import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, StyleSheet, FlatList, Dimensions, Modal, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionic from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { base_url } from '../../utils/base_url';
import FollowButton from '../Follow/FollowButton';
import io from 'socket.io-client';
import { SOCKET_URL } from '../../config';

const { width } = Dimensions.get('window');

const Post = ({ item, isFromProfile, onDelete, isVisible }) => {
  const [like, setLike] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likesCount || 0);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [isCommenting, setIsCommenting] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const socketRef = useRef(null);
  const isRoomJoined = useRef(false);
  const isCommentRoomJoined = useRef(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
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

    // Initialize socket connection if not already connected
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL);
      
      // Wait for socket to connect before setting up listeners
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
        if (isRoomJoined.current) {
          leaveLikeRoom();
        }
        if (isCommentRoomJoined.current) {
          leaveCommentRoom();
        }
        // Remove all listeners
        socketRef.current.removeAllListeners();
      }
    };
  }, []);

  // Handle post visibility changes
  useEffect(() => {
    if (isVisible && !isRoomJoined.current) {
      joinLikeRoom();
    } else if (!isVisible && isRoomJoined.current) {
      leaveLikeRoom();
    }
  }, [isVisible]);

  // Check like status when component mounts or becomes visible
  useEffect(() => {
    if (isVisible && socketRef.current && currentUserId) {
      console.log(`Post ${item._id} - Checking initial like status`);
      socketRef.current.emit('check-like-status', {
        moduleId: item._id,
        moduleType: 'post',
        userId: currentUserId
      });
    }
  }, [isVisible, currentUserId]);

  // Setup socket listeners
  const setupSocketListeners = () => {
    if (!socketRef.current) return;

    // Like-related listeners
    socketRef.current.on('join-like-room-status', (data) => {
      console.log(`Post ${item._id} - Join room status:`, data);
      if (data.moduleId === item._id) {
        isRoomJoined.current = true;
        requestLikeCount();
      }
    });

    socketRef.current.on('leave-like-room-status', (data) => {
      console.log(`Post ${item._id} - Leave room status:`, data);
      if (data.moduleId === item._id) {
        isRoomJoined.current = false;
      }
    });

    socketRef.current.on('like-count-status', (data) => {
      if (data.moduleId === item._id) {
        console.log(`Post ${item._id} - Like count updated:`, data.likeCount);
        setLikeCount(data.likeCount);
      }
    });

    socketRef.current.on('like-status', (data) => {
      if (data.moduleId === item._id) {
        console.log(`Post ${item._id} - Like status response:`, data);
        if (data.liked !== undefined) {
          setLike(data.liked);
        } else if (data.message) {
          if (data.message.includes('liked')) {
            setLike(true);
          } else if (data.message.includes('unliked')) {
            setLike(false);
          }
        }
        setIsLiking(false);
        requestLikeCount();
      }
    });

    // Comment-related listeners
    socketRef.current.on('join-comment-room-status', (data) => {
      console.log('Joined comment room:', data);
      if (data.moduleId === item._id) {
        isCommentRoomJoined.current = true;
      }
    });

    socketRef.current.on('leave-comment-room-status', (data) => {
      console.log('Left comment room:', data);
      if (data.moduleId === item._id) {
        isCommentRoomJoined.current = false;
      }
    });

    socketRef.current.on('comment-status', (data) => {
      console.log('Received comment status:', data);
      if (data.status && data.comment && data.moduleId === item._id) {
        setComments(prevComments => [data.comment, ...prevComments]);
        setCommentText('');
        setIsCommenting(false);
      }
    });

    socketRef.current.on('comment-list', (data) => {
      console.log('Comment list received:', data);
      if (data.moduleId === item._id && data.comments) {
        setComments(data.comments);
      }
    });

    socketRef.current.on('comment-error', (error) => {
      console.error('Comment error:', error);
      if (error.moduleId === item._id) {
        setIsCommenting(false);
        Alert.alert('Error', error.message || 'Failed to add comment');
      }
    });

    socketRef.current.on('comment-deleted', (data) => {
      console.log('Comment deleted:', data);
      if (data.moduleId === item._id) {
        setComments(prevComments => 
          prevComments.filter(comment => comment._id !== data.commentId)
        );
      }
    });

    socketRef.current.on('comment-delete-error', (error) => {
      console.error('Comment delete error:', error);
      if (error.moduleId === item._id) {
        Alert.alert('Error', error.message || 'Failed to delete comment');
      }
    });
  };

  const joinLikeRoom = () => {
    if (socketRef.current && !isRoomJoined.current) {
      console.log(`Post ${item._id} - Joining like room`);
      socketRef.current.emit('join-like-room', {
        moduleId: item._id,
        moduleType: 'post'
      });
    }
  };

  const leaveLikeRoom = () => {
    if (socketRef.current && isRoomJoined.current) {
      console.log(`Post ${item._id} - Leaving like room`);
      socketRef.current.emit('leave-like-room', {
        moduleId: item._id,
        moduleType: 'post'
      });
    }
  };

  const joinCommentRoom = () => {
    if (socketRef.current && !isCommentRoomJoined.current) {
      console.log(`Post ${item._id} - Joining comment room`);
      socketRef.current.emit('join-comment-room', {
        moduleId: item._id,
        moduleType: 'post'
      });
    }
  };

  const leaveCommentRoom = () => {
    if (socketRef.current && isCommentRoomJoined.current) {
      console.log(`Post ${item._id} - Leaving comment room`);
      socketRef.current.emit('leave-comment-room', {
        moduleId: item._id,
        moduleType: 'post'
      });
    }
  };

  const requestLikeCount = () => {
    if (socketRef.current) {
      console.log(`Post ${item._id} - Requesting like count`);
      socketRef.current.emit('like-count', {
        moduleType: 'post',
        moduleId: item._id
      });
    }
  };

  const handleLike = async () => {
    if (!currentUserId) {
      Alert.alert('Error', 'Please login to like posts');
      return;
    }

    if (isLiking) {
      return; // Prevent multiple clicks while processing
    }

    try {
      setIsLiking(true);
      
      if (like) {
        // Unlike
        console.log(`Post ${item._id} - Emitting unlike event`);
        socketRef.current.emit('unlike', {
          likedBy: currentUserId,
          moduleType: 'post',
          moduleId: item._id,
          moduleCreatedBy: item.createdBy
        });
      } else {
        // Like
        console.log(`Post ${item._id} - Emitting like event`);
        socketRef.current.emit('like', {
          likedBy: currentUserId,
          moduleType: 'post',
          moduleId: item._id,
          moduleCreatedBy: item.createdBy
        });
      }
    } catch (error) {
      console.error('Like/Unlike Error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
      // Revert optimistic update on error
      setLike(like);
      setLikeCount(prevCount => like ? prevCount + 1 : prevCount - 1);
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setShowMenu(false);
      const token = await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      const response = await fetch(`${base_url}/post/delete/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.status) {
        Alert.alert('Success', 'Post deleted successfully');
        if (isFromProfile) {
          if (typeof onDelete === 'function') {
            onDelete(item.id);
          }
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Delete Error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // const handleSavePost = async () => {
  //   try {
  //     const token = await AsyncStorage.getItem('accessToken');
      
  //     if (!token) {
  //       Alert.alert('Error', 'Authentication token not found');
  //       return;
  //     }

  //     const response = await fetch(`${base_url}/post/save/${item._id}`, {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json'
  //       }
  //     });

  //     const data = await response.json();
  //     console.log(data)

  //     if (response.ok && data.status) {
  //       setIsSaved(!isSaved);
  //       Alert.alert('Success', isSaved ? 'Post unsaved successfully' : 'Post saved successfully');
  //     } else {
  //       Alert.alert('Error', data.message || 'Failed to save post');
  //     }
  //   } catch (error) {
  //     console.error('Save Error:', error);
  //     Alert.alert('Error', 'Network error. Please check your connection and try again.');
  //   }
  // };

  // const renderImage = ({ item: imageUrl }) => {
  //   let processedUrl = imageUrl;
    
  //   try {
  //     // If the URL is a stringified array
  //     if (typeof imageUrl === 'string' && imageUrl.startsWith('[')) {
  //       const parsedUrls = JSON.parse(imageUrl);
  //       processedUrl = parsedUrls[0];
  //     }

  //     // Clean up the URL
  //     if (processedUrl.startsWith('/data/')) {
  //       processedUrl = `file://${processedUrl}`;
  //     } else if (processedUrl.includes('file:///data/')) {
  //       processedUrl = processedUrl.replace('file:///', 'file://');
  //     }

  //     console.log('Processed URL:', processedUrl);
  //   } catch (e) {
  //     console.log('Error processing URL:', e);
  //     processedUrl = imageUrl;
  //   }

  //   return (
  //     <View style={styles.postImageContainer}>
  //       <Image
  //         source={{ uri: processedUrl }}
  //         style={styles.postImage}
  //         resizeMode="cover"
  //       />
  //     </View>
  //   );
  // };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return dateString;
    }
  };

  // Render image directly if only one image, else use FlatList
  const hasImages = item.mediaType === 'image' && item.imageUrl && item.imageUrl.length > 0;
  const isSingleImage = hasImages && item.imageUrl.length === 1;
  console.log(currentUserId)

  // Defensive check for first image URL (now using imageUrl)
  const firstImageUrl =
    Array.isArray(item.imageUrl) && item.imageUrl.length > 0 && typeof item.imageUrl[0] === 'string' && item.imageUrl[0].trim() !== ''
      ? item.imageUrl[0]
      : 'https://via.placeholder.com/150';

  // Handle comment modal visibility
  useEffect(() => {
    if (showCommentModal) {
      joinCommentRoom();
      // Load comments when modal opens with a slight delay
      setTimeout(() => {
        handleListComments();
      }, 300);
    } else {
      leaveCommentRoom();
    }
  }, [showCommentModal]);

  // Function to handle comment deletion (add this new function)
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
          socketRef.current.emit('delete-comment', {
            commentId,
            commentedBy: currentUserId
          });
        }
      }
    ]
  );
};

 // Updated comment submission handler
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
        return; // Prevent multiple submissions
    }

    try {
        setIsCommenting(true);
        console.log('Submitting comment for post:', item._id);

        // First join the comment room
        socketRef.current.emit('join-comment-room', {
            moduleId: item._id,
            moduleType: 'post'
        });

        // Wait a bit for the room to be joined
        await new Promise(resolve => setTimeout(resolve, 100));

        // Prepare the comment payload
        const commentPayload = {
            moduleId: item._id,
            moduleType: 'post',
            moduleCreatedBy: item.createdBy,
            commentedBy: currentUserId,
            commentData: commentText.trim()
        };

        console.log('Sending comment payload:', commentPayload);

        // Send the comment
        socketRef.current.emit('comment', commentPayload);

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

  // Updated comment item render (modify the FlatList renderItem in your JSX)
const renderCommentItem = ({ item: comment }) => (
  <View style={styles.commentItem}>
    <View style={styles.commentHeader}>
      <Text style={styles.commentUser}>
        {comment.commentedBy?.fullName || comment.commentedBy?.username || 'User'}
      </Text>
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
    <Text style={styles.commentDate}>
      {formatDate(comment.createdAt)}
    </Text>
  </View>
);

  // Updated comment list handler
const handleListComments = () => {
  if (socketRef.current && item._id) {
    console.log('Requesting comments for post:', item._id);
    socketRef.current.emit('list-comment', {
      moduleId: item._id,  
      moduleType: 'post'
    });
  }
};

  // Log the URL before rendering
  return (
    <View style={styles.postContainer}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.postTitle}</Text>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={styles.headerActions}>
          {currentUserId !== item.createdBy && (
            <View style={styles.followButtonContainer}>
              <FollowButton userId={item.createdBy} />
            </View>
          )}
          {isFromProfile && (
            <TouchableOpacity onPress={() => setShowMenu(true)}>
              <Feather name="more-vertical" style={styles.moreIcon} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Only render the image if the URL is a non-empty string */}
      {hasImages && firstImageUrl && firstImageUrl !== '' && (
        <TouchableOpacity 
          style={styles.postImageContainer}
          onPress={() => setShowFullImage(true)}
        >
          <Image
            source={{ uri: firstImageUrl }}
            style={styles.postImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}

      <View style={styles.actionsContainer}>
        <View style={styles.leftActions}>
          <TouchableOpacity 
            onPress={handleLike}
            disabled={isLiking}
          >
            <AntDesign
              name={like ? 'heart' : 'hearto'}
              style={[
                styles.likeIcon, 
                { 
                  color: like ? 'red' : 'black',
                  opacity: isLiking ? 0.5 : 1 
                }
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowCommentModal(true)}>
            <Ionic name="chatbubble-outline" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Feather name="navigation" style={styles.icon} />
          </TouchableOpacity>
        </View>
        {/* <TouchableOpacity onPress={handleSavePost}>
          <Feather 
            name="bookmark"
            style={[styles.bookmarkIcon, { color: isSaved ? '#A60F93' : '#000' }]} 
          />
        </TouchableOpacity> */}
      </View>

      <View style={styles.likesContainer}>
        <Text style={styles.statsText}>
          {likeCount} likes • {item.commentsCount} comments • {item.shareCount} shares
        </Text>
        {/* {item.tags && item.tags.length > 0 && (
          <Text style={styles.tagsText}>
            Tags: {item.tags.join(', ')}
          </Text>
        )} */}
      </View>

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
                />
                <TouchableOpacity 
                  style={[
                    styles.commentSubmitButton,
                    { opacity: commentText.trim() ? 1 : 0.5 }
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
  keyExtractor={(comment, index) => comment._id || index.toString()}
  renderItem={renderCommentItem}
  style={styles.commentsList}
  showsVerticalScrollIndicator={false}
 />
            </View>
          </View>
        </View>
      </Modal>

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={[styles.menuItem, styles.deleteMenuItem]}
              onPress={handleDelete}
              disabled={isDeleting}
            >
              <Feather name="trash-2" size={20} color="#FF3B30" />
              <Text style={[styles.menuText, styles.deleteMenuText]}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Full Screen Image Modal */}
      <Modal
        visible={showFullImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullImage(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowFullImage(false)}
          >
            <Ionic name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: firstImageUrl }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  postContainer: {
    width: width,
    alignSelf: 'center',
    paddingBottom: 10,
    borderBottomColor: 'gray',
    borderBottomWidth: 0.1,
    backgroundColor: '#fff',
    marginBottom: 10,
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  userInfo: {
    flex: 1,
    marginRight: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },
  followButtonContainer: {
    marginRight: 5,
  },
  moreIcon: {
    fontSize: 20,
    paddingHorizontal: 3,
  },
  postImageContainer: {
    width: width,
    alignSelf: 'center',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    //borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 0,
  },
  postImage: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    //borderRadius: 10,
  },
  imageList: {
    width: '100%',
    padding: 0,
    margin: 0,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeIcon: {
    paddingRight: 8,
    fontSize: 20,
  },
  icon: {
    fontSize: 20,
    paddingRight: 8,
  },
  bookmarkIcon: {
    fontSize: 20,
    marginLeft: 5,
  },
  likesContainer: {
    paddingHorizontal: 15,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  tagsText: {
    fontSize: 14,
    color: '#1e88e5',
    marginTop: 5,
  },
  commentSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    width: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  menuText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  deleteMenuItem: {
    marginTop: 5,
  },
  deleteMenuText: {
    color: '#FF3B30',
  },
  commentModalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    height: '60%',
    maxHeight: '80%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 15,
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
    backgroundColor: '#A60F93',
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
  commentUser: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 14,
    color: '#333',
  },
  commentText: {
    color: '#333',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
  },
  commentDate: {
    fontSize: 12,
    color: '#666',
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
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
});

export default Post;