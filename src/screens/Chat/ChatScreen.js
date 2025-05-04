import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../components/Text/TextDefault/styles';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [image, setImage] = useState(null);
  const scrollViewRef = useRef();
  const route = useRoute();
  const navigation = useNavigation();
  const { userId, userName } = route.params;

  useEffect(() => {
    fetchMessages();
  }, [userId]);

  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchMessages = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(`${API_URL}/api/messages/${userId}`, { headers });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !image) return;

    try {
      const headers = await getAuthHeaders();
      let imageUrl = null;
      
      if (image) {
        const formData = new FormData();
        formData.append('image', {
          uri: image,
          type: 'image/jpeg',
          name: 'image.jpg'
        });
        const uploadResponse = await axios.post(`${API_URL}/api/upload/image`, formData, { headers });
        imageUrl = uploadResponse.data.url;
      }

      const response = await axios.post(`${API_URL}/api/messages/send/${userId}`, {
        receiverId: userId,
        text: newMessage,
        image: imageUrl
      }, { headers });

      setMessages([...messages, response.data]);
      setNewMessage('');
      setImage(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.userName}>{userName}</Text>
      </View>

      {/* Message Section */}
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
      >
        {messages.map((message, index) => (
          <View 
            key={index} 
            style={[
              styles.messageContainer,
              message.senderId !== userId ? styles.sentMessageContainer : styles.receivedMessageContainer
            ]}
          >
            <View style={[
              styles.messageBubble,
              message.senderId !== userId ? styles.sentMessageBubble : styles.receivedMessageBubble
            ]}>
              {message.image && (
                <Image 
                  source={{ uri: message.image }} 
                  style={styles.messageImage}
                  resizeMode="cover"
                />
              )}
              {message.text && (
                <Text style={[
                  styles.messageText,
                  message.senderId !== userId ? styles.sentMessageText : styles.receivedMessageText
                ]}>
                  {message.text}
                </Text>
              )}
              <Text style={[
                styles.timestamp,
                message.senderId !== userId ? styles.sentTimestamp : styles.receivedTimestamp
              ]}>
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input Section */}
      <View style={styles.inputContainer}>
        {/* <TouchableOpacity onPress={pickImage} style={styles.attachmentButton}>
          <Ionicons name="attach" size={24} color={colors.Zypsii_color}/>
        </TouchableOpacity> */}
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userName: { 
    flex: 1, 
    fontSize: 18, 
    fontWeight: 'bold', 
    textAlign: 'center',
    color: '#333'
  },
  messagesContainer: { 
    padding: 16,
    paddingBottom: 8
  },
  messageContainer: {
    marginBottom: 8,
    maxWidth: '80%',
  },
  sentMessageContainer: {
    alignSelf: 'flex-end',
  },
  receivedMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    maxWidth: '100%',
  },
  sentMessageBubble: {
    backgroundColor: '#A60F93',
    borderTopRightRadius: 0,
  },
  receivedMessageBubble: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 0,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  sentMessageText: {
    color: '#fff',
  },
  receivedMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  sentTimestamp: {
    color: '#fff',
    textAlign: 'right',
  },
  receivedTimestamp: {
    color: '#666',
    textAlign: 'left',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  attachmentButton: {
    padding: 8,
  },
  sendButton: {
    backgroundColor: '#A60F93',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});

export default ChatScreen;
