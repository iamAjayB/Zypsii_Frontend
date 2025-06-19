import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Animated,
  Easing,
  Image,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import { API_URL } from '../../config';
import { colors } from '../../utils';
import { LinearGradient } from 'expo-linear-gradient';
import { Video } from 'expo-av';

const { width, height } = Dimensions.get('window');

const ChatScreen = ({ route, navigation }) => {
  const { userId, userName, userProfilePicture } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [previewModal, setPreviewModal] = useState({
    visible: false,
    content: null,
    type: null
  });
  const flatListRef = useRef(null);
  const sendButtonScale = useRef(new Animated.Value(1)).current;
  const typingOpacity = useRef(new Animated.Value(0)).current;

  // Handle status bar for preview modal
  useEffect(() => {
    if (previewModal.visible) {
      StatusBar.setHidden(true);
    } else {
      StatusBar.setHidden(false);
      StatusBar.setBarStyle('light-content');
    }
  }, [previewModal.visible]);

  useEffect(() => {
    initializeChat();
    return () => {
      if (socket) {
        // Leave chat room before disconnecting
        if (currentUserId) {
          socket.emit('leave-chat-room', {
            senderId: currentUserId,
            receiverId: userId
          });
        }
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    // Enhanced header with gradient-style background
    navigation.setOptions({
      title: userName,
      headerStyle: {
        backgroundColor: colors.Zypsii_color,
        shadowColor: colors.Zypsii_color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: '700',
        fontSize: 18,
      },
      headerRight: () => (
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="videocam" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, userName]);

  // Animation for send button
  const animateSendButton = () => {
    Animated.sequence([
      Animated.timing(sendButtonScale, {
        toValue: 0.9,
        duration: 100,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(sendButtonScale, {
        toValue: 1,
        duration: 100,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Animation for typing indicator
  const showTypingIndicator = () => {
    setIsTyping(true);
    Animated.timing(typingOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideTypingIndicator = () => {
    Animated.timing(typingOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsTyping(false));
  };

  const initializeChat = async () => {
    try {
      // Get current user ID from AsyncStorage
      const token = await AsyncStorage.getItem('accessToken');
      const userDataString = await AsyncStorage.getItem('user');

      if (!token || !userDataString) {
        Alert.alert('Error', 'Authentication required');
        navigation.goBack();
        return;
      }

      // Parse the user data string to get the user ID
      const userData = JSON.parse(userDataString);
      const userIdFromStorage = userData._id;

      setCurrentUserId(userIdFromStorage);

      // Initialize socket connection with reconnection options
      const socketInstance = io(API_URL, {
        auth: {
          token: token
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      setSocket(socketInstance);

      // Socket event listeners
      socketInstance.on('connect', () => {
        console.log('Connected to socket server');
        setIsConnected(true);

        // Join chat room
        socketInstance.emit('join-chat-room', {
          senderId: userIdFromStorage,
          receiverId: userId
        });

        // Mark messages as read when entering chat
        socketInstance.emit('mark-as-read', {
            senderId: userIdFromStorage,
            receiverId: userId
          });

        // Fetch chat history
          socketInstance.emit('chat-history', {
            senderId: userIdFromStorage,
            receiverId: userId
        });
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
        setLoading(false);
        Alert.alert('Connection Error', 'Failed to connect to chat server. Please check your internet connection.');
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('Disconnected from socket server:', reason);
        setIsConnected(false);
        if (reason === 'io server disconnect') {
          socketInstance.connect();
        }
      });

      socketInstance.on('reconnect_attempt', (attemptNumber) => {
        console.log('Attempting to reconnect:', attemptNumber);
      });

      socketInstance.on('reconnect', (attemptNumber) => {
        console.log('Reconnected after', attemptNumber, 'attempts');
        setIsConnected(true);
        socketInstance.emit('join-chat-room', {
          senderId: userIdFromStorage,
          receiverId: userId
        });
        socketInstance.emit('chat-history', {
          senderId: userIdFromStorage,
          receiverId: userId
        });
      });

      socketInstance.on('reconnect_error', (error) => {
        console.error('Reconnection error:', error);
      });

      socketInstance.on('reconnect_failed', () => {
        console.error('Failed to reconnect');
        Alert.alert('Connection Error', 'Unable to reconnect to chat server. Please try again later.');
      });

      socketInstance.on('is-chat-room-joined', (message) => {
        console.log('Chat room joined:', message);
      });

      socketInstance.on('is-leave-chat-room', (message) => {
        console.log('Chat room left:', message);
      });

      socketInstance.on('receive-message', (message) => {
        console.log('Received message:', message);
        if (message && message.message) {
          // Handle both old and new message formats
          const senderId = message.sender ? message.sender._id : (message.senderId ? (typeof message.senderId === 'string' ? message.senderId : message.senderId._id) : null);
          
          if (senderId) {
            setMessages(prevMessages => [...prevMessages, message]);
            scrollToBottom();
            
            // Mark message as read if it's from the other user
            if (senderId === userId) {
              socketInstance.emit('mark-as-read', {
                senderId: userIdFromStorage,
                receiverId: userId
              });
            }
          }
        } else {
          console.warn('Received invalid message format:', message);
        }
      });

      socketInstance.on('chat-history-result', (chatHistory) => {
        console.log('Chat history received:', chatHistory);
        if (Array.isArray(chatHistory)) {
          setMessages(chatHistory);
          setLoading(false);
          setTimeout(() => scrollToBottom(), 100);
          
          // Mark messages as read after loading history
          if (chatHistory.length > 0) {
            socketInstance.emit('mark-as-read', {
              senderId: userIdFromStorage,
              receiverId: userId
            });
          }
        } else {
          console.warn('Invalid chat history format:', chatHistory);
          setMessages([]);
          setLoading(false);
        }
      });

      socketInstance.on('chat-history-error', (error) => {
        console.error('Chat history error:', error);
        setLoading(false);
        Alert.alert(
          'Error',
          'Failed to load chat history. Please try again.',
          [
            {
              text: 'Retry',
              onPress: () => {
                setLoading(true);
                socketInstance.emit('chat-history', {
                  senderId: userIdFromStorage,
                  receiverId: userId
                });
              }
            },
            {
              text: 'OK',
              style: 'cancel'
            }
          ]
        );
      });

      socketInstance.on('chat-error', (error) => {
        console.error('Chat error:', error);
        setSending(false);
        Alert.alert('Error', error.message || 'Failed to send message');
      });

      socketInstance.on('messages-marked-read', (data) => {
        console.log('Messages marked as read:', data);
        // Update local messages to mark them as read
        setMessages(prevMessages => 
          prevMessages.map(msg => ({
            ...msg,
            read: true
          }))
        );
      });

    } catch (error) {
      console.error('Initialization error:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to initialize chat');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !socket || sending || !isConnected) return;

    setSending(true);
    animateSendButton();

    try {
      socket.emit('send-message', {
        senderId: currentUserId,
        receiverId: userId,
        message: newMessage.trim()
      });

      setNewMessage('');
      setSending(false);
    } catch (error) {
      console.error('Send message error:', error);
      setSending(false);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const formatMessageTime = (timestamp) => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return messageDate.toLocaleDateString([], {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const formatDate = (timestamp) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const renderDateHeader = ({ item, index, messages }) => {
    if (index === 0) {
      return (
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>
      );
    }

    const previousMessage = messages[index - 1];
    const currentDate = new Date(item.createdAt).toDateString();
    const previousDate = new Date(previousMessage.createdAt).toDateString();

    if (currentDate !== previousDate) {
      return (
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>
      );
    }

    return null;
  };

  const renderSharedContent = ({ moduleType, sharedContent }) => {
    if (!sharedContent) return null;

    const renderPreview = () => {
      switch (moduleType) {
        case 'post':
          return (
            <View style={styles.sharedContentPreview}>
              {sharedContent.mediaUrl && sharedContent.mediaUrl.length > 0 && (
                <View style={styles.sharedImageContainer}>
                  <Image 
                    source={{ uri: sharedContent.mediaUrl[0] }} 
                    style={styles.sharedContentImage}
                    resizeMode="cover"
                  />
                </View>
              )}
              <View style={styles.sharedContentTextContainer}>
                <Text style={styles.sharedContentTitle} numberOfLines={2}>
                  {sharedContent.postTitle || 'Shared post'}
                </Text>
                {sharedContent.mediaType && (
                  <Text style={styles.sharedContentSubtext}>
                    {sharedContent.mediaType} • {sharedContent.postType}
                  </Text>
                )}
              </View>
            </View>
          );
        case 'shorts':
          return (
            <View style={styles.sharedContentPreview}>
              <View style={styles.sharedImageContainer}>
                <Image 
                  source={{ uri: sharedContent.thumbnailUrl || sharedContent.videoUrl }} 
                  style={styles.sharedContentImage}
                  resizeMode="cover"
                />
                {/* Play icon overlay */}
                <View style={styles.playIconOverlay}>
                  <Ionicons name="play-circle" size={30} color="#fff" />
                </View>
              </View>
              <View style={styles.sharedContentTextContainer}>
                <Text style={styles.sharedContentTitle} numberOfLines={2}>
                  {sharedContent.title || 'Shared short'}
                </Text>
                {sharedContent.description && (
                  <Text style={styles.sharedContentSubtext} numberOfLines={1}>
                    {sharedContent.description}
                  </Text>
                )}
              </View>
            </View>
          );
        case 'story':
          return (
            <View style={styles.sharedContentPreview}>
              {sharedContent.media && (
                <Image 
                  source={{ uri: sharedContent.media }} 
                  style={styles.sharedContentImage}
                  resizeMode="cover"
                />
              )}
              <Text style={styles.sharedContentText} numberOfLines={2}>Story</Text>
            </View>
          );
        case 'schedules':
          return (
            <View style={styles.sharedContentPreview}>
              {sharedContent.bannerImage && (
                <View style={styles.sharedImageContainer}>
                  <Image 
                    source={{ uri: sharedContent.bannerImage }} 
                    style={styles.sharedContentImage}
                    resizeMode="cover"
                  />
                </View>
              )}
              <View style={styles.sharedContentTextContainer}>
                <Text style={styles.sharedContentTitle} numberOfLines={2}>
                  {sharedContent.tripName || 'Shared schedule'}
                </Text>
                {sharedContent.bannerImage && (
                  <Text style={styles.sharedContentSubtext} numberOfLines={1}>
                    {sharedContent.bannerImage.split('/').pop()}
                  </Text>
                )}
              </View>
            </View>
          );
        default:
          return null;
      }
    };

    return (
      <TouchableOpacity 
        style={styles.sharedContentContainer}
        onPress={() => handleSharedContentPress(moduleType, sharedContent)}
      >
        {renderPreview()}
      </TouchableOpacity>
    );
  };

  const handleSharedContentPress = (moduleType, content) => {
    setPreviewModal({
      visible: true,
      content,
      type: moduleType
    });
  };

  const renderPreviewModal = () => {
    const { visible, content, type } = previewModal;
    if (!visible || !content) return null;

    const closePreview = () => {
      setPreviewModal({
        visible: false,
        content: null,
        type: null
      });
    };

    const renderPreviewContent = () => {
      switch (type) {
        case 'post':
          return (
            <View style={styles.previewContent}>
              {content.mediaUrl && content.mediaUrl.length > 0 && (
                <Image 
                  source={{ uri: content.mediaUrl[0] }}
                  style={styles.previewImage}
                />
              )}
              <Text style={styles.previewTitle}>{content.postTitle || 'Shared post'}</Text>
              {content.mediaType && (
                <Text style={styles.previewSubtext}>
                  {content.mediaType} • {content.postType}
                </Text>
              )}
            </View>
          );
        case 'shorts':
          return (
            <View style={styles.previewContent}>
              {content.videoUrl ? (
                <Video
                  source={{ uri: content.videoUrl }}
                  style={styles.previewVideo}
                  useNativeControls
                  resizeMode="contain"
                  shouldPlay={true}
                  isLooping
                />
              ) : (
                <Image 
                  source={{ uri: content.thumbnail }}
                  style={styles.previewImage}
                />
              )}
              <Text style={styles.previewTitle}>{content.caption || 'Shared short'}</Text>
            </View>
          );
        case 'story':
          return (
            <View style={styles.previewContent}>
              {content.media && (
                <Image 
                  source={{ uri: content.media }}
                  style={styles.previewImage}
                />
              )}
              <Text style={styles.previewTitle}>Story</Text>
            </View>
          );
        case 'schedules':
          return (
            <View style={styles.previewContent}>
              <Text style={styles.previewTitle}>{content.title || 'Shared schedule'}</Text>
              {content.description && (
                <Text style={styles.previewDescription}>{content.description}</Text>
              )}
            </View>
          );
        default:
          return null;
      }
    };

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={closePreview}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={closePreview}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            {renderPreviewContent()}
          </View>
        </View>
      </Modal>
    );
  };

  const renderMessage = ({ item, index }) => {
    const senderId = item.sender ? item.sender._id : (item.senderId ? (typeof item.senderId === 'string' ? item.senderId : item.senderId._id) : null);
    const isMyMessage = senderId === currentUserId;
    
    const isFirstInGroup = index === 0 || 
      (() => {
        const prevItem = messages[index - 1];
        const prevSenderId = prevItem.sender ? prevItem.sender._id : (prevItem.senderId ? (typeof prevItem.senderId === 'string' ? prevItem.senderId : prevItem.senderId._id) : null);
        return prevSenderId !== senderId;
      })();
    
    const isLastInGroup = index === messages.length - 1 || 
      (() => {
        const nextItem = messages[index + 1];
        const nextSenderId = nextItem.sender ? nextItem.sender._id : (nextItem.senderId ? (typeof nextItem.senderId === 'string' ? nextItem.senderId : nextItem.senderId._id) : null);
        return nextSenderId !== senderId;
      })();

    return (
      <>
        {renderDateHeader({ item, index, messages })}
        <Animated.View style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
          isFirstInGroup && styles.firstInGroup,
          isLastInGroup && styles.lastInGroup
        ]}>
          {!isMyMessage && isFirstInGroup && (
            <View style={styles.messageHeader}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: userProfilePicture }}
                  style={styles.userAvatar}
                />
                <View style={styles.onlineIndicator} />
              </View>
              <Text style={styles.userName}>{userName}</Text>
            </View>
          )}
          <LinearGradient
            colors={isMyMessage ? 
              [colors.Zypsii_color, '#6366f1'] : 
              ['#ffffff', '#f8fafc']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.messageBubble,
              isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
              isFirstInGroup && (isMyMessage ? styles.myFirstBubble : styles.otherFirstBubble),
              isLastInGroup && (isMyMessage ? styles.myLastBubble : styles.otherLastBubble)
            ]}
          >
            <Text style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText
            ]}>
              {item.message}
            </Text>
            
            {item.shareData && item.sharedContent && (
              renderSharedContent({
                moduleType: item.shareData.moduleType,
                sharedContent: item.sharedContent
              })
            )}

            <View style={styles.messageFooter}>
              <Text style={[
                styles.messageTime,
                isMyMessage ? styles.myMessageTime : styles.otherMessageTime
              ]}>
                {formatMessageTime(item.createdAt)}
              </Text>
              {isMyMessage && (
                <Ionicons 
                  name={item.read ? "checkmark-done" : "checkmark"} 
                  size={14} 
                  color={item.read ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.7)"} 
                  style={styles.readIndicator}
                />
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </>
    );
  };

  const renderSeparator = () => <View style={styles.messageSeparator} />;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={colors.Zypsii_color} />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.Zypsii_color} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Connection Status */}
        {!isConnected && (
          <View style={styles.connectionStatus}>
            <Text style={styles.connectionText}>Connecting...</Text>
          </View>
        )}

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => {
            // Handle both old and new data structures
            if (item._id) return item._id.toString();
            // Fallback to index if no _id
            return index.toString();
          }}
          contentContainerStyle={styles.messagesContainer}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyContent}>
                <Ionicons name="chatbubbles-outline" size={64} color="#cbd5e0" />
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySubText}>Start the conversation with {userName}!</Text>
              </View>
            </View>
          }
          onContentSizeChange={() => scrollToBottom()}
          onLayout={() => scrollToBottom()}
          showsVerticalScrollIndicator={false}
        />

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor="#a0aec0"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={1000}
              editable={!sending && isConnected}
            />
            <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!newMessage.trim() || sending || !isConnected) && styles.sendButtonDisabled
                ]}
                onPress={sendMessage}
                disabled={!newMessage.trim() || sending || !isConnected}
                activeOpacity={0.8}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
        {renderPreviewModal()}
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  headerButton: {
    marginRight: 15,
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  loadingText: {
    marginTop: 16,
    color: '#1e293b',
    fontSize: 15,
    fontWeight: '600',
  },
  messagesContainer: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  emptyText: {
    fontSize: 24,
    color: '#1e293b',
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  messageContainer: {
    marginVertical: 2,
    width: '100%',
    paddingHorizontal: 8,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
    width: '100%',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
    width: '100%',
  },
  firstInGroup: {
    marginTop: 16,
  },
  lastInGroup: {
    marginBottom: 16,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  myMessageBubble: {
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    borderBottomLeftRadius: 4,
  },
  myFirstBubble: {
    borderTopRightRadius: 20,
  },
  myLastBubble: {
    borderBottomRightRadius: 20,
  },
  otherFirstBubble: {
    borderTopLeftRadius: 20,
  },
  otherLastBubble: {
    borderBottomLeftRadius: 20,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  myMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {
    color: '#1e293b',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  messageTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  otherMessageTime: {
    color: '#64748b',
  },
  readIndicator: {
    marginLeft: 4,
  },
  messageSeparator: {
    height: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 4,
  },
  dateHeader: {
    alignItems: 'center',
    marginVertical: 24,
  },
  dateText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sharedContentContainer: {
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
    maxWidth: 280,
  },
  sharedContentPreview: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  sharedImageContainer: {
    width: 150,
    height: 120,
    position: 'relative',
  },
  sharedContentImage: {
    width: '100%',
    height: '100%',
  },
  playIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  sharedContentTextContainer: {
    padding: 12,
    width: '100%',
  },
  sharedContentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  sharedContentSubtext: {
    fontSize: 13,
    color: '#64748b',
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
    color: '#1e293b',
    fontWeight: '400',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.Zypsii_color,
    shadowColor: colors.Zypsii_color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  connectionStatus: {
    backgroundColor: '#ef4444',
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  previewContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  previewVideo: {
    width: '100%',
    height: '100%',
  },
  previewTitle: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 10,
  },
  previewSubtext: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 5,
  },
  previewDescription: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 5,
    lineHeight: 20,
  },
});

export default ChatScreen;