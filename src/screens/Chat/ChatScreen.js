import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ChatScreen = () => {
 
  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.userName}>Jenish</Text>
        <Ionicons name="call-outline" size={24} color="black" />
      </View>

      {/* Message Section */}
      <ScrollView contentContainerStyle={styles.messagesContainer}>
        <Text style={styles.date}>Today</Text>

        <View style={styles.messageRow}>
          <View style={styles.receivedMessage}>
            <Text>Hello! 😊</Text>
            <Text style={styles.timestamp}>9:24 AM</Text>
          </View>
        </View>

        <View style={styles.messageRowRight}>
          <View style={styles.sentMessage}>
            <Text>
              Thank you very much for your traveling, we really like the apartments.  
              We will stay here for another 5 days...
            </Text>
            <Text style={styles.timestamp}>9:30 AM</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  userName: { flex: 1, fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  messagesContainer: { padding: 16 },
  date: {
    alignSelf: 'center',
    color: '#666',
    fontSize: 14,
    marginBottom: 10,
  },
  messageRow: { flexDirection: 'row', marginBottom: 8 },
  messageRowRight: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  receivedMessage: {
    maxWidth: '70%',
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 12,
    borderTopLeftRadius: 0,
  },
  sentMessage: {
    maxWidth: '70%',
    backgroundColor: '#d1f7c4',
    padding: 10,
    borderRadius: 12,
    borderTopRightRadius: 0,
  },
  timestamp: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
});

export default ChatScreen;
