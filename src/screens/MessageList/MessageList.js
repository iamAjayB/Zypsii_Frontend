import React from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, TextInput } from 'react-native';
// import { Avatar } from 'react-native-paper';


const chatData = [
  { id: '1', name: 'Sajib Rahman', lastMessage: 'Hi, John! 👋 How are you doing?', time: '09:46', status: 'read' },
  { id: '2', name: 'Adam Shafi', lastMessage: 'Typing...', time: '08:42', status: 'typing' },
  { id: '3', name: 'HR Rumen', lastMessage: 'Cool! 😊 Let\'s meet at 18:00 near the traveling!', time: 'Yesterday', status: 'read' },
  { id: '4', name: 'Anjelina', lastMessage: 'Hey, will you come to the party on Saturday?', time: '07:56', status: 'unread' },
  { id: '5', name: 'Alexa Shorna', lastMessage: 'Thank you for coming! Your order...', time: '05:12', status: 'read' },
];

const MessageList = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('ChatScreen')}
    >
      {/* <Avatar.Image size={48} source={require('')} /> */}
      <View style={styles.textContent}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={[styles.lastMessage, item.status === 'typing' && styles.typing]}>
          {item.lastMessage}
        </Text>
      </View>
      <View style={styles.timeContainer}>
        <Text style={styles.time}>{item.time}</Text>
        {item.status === 'unread' && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        {/* <Ionicons name="search" size={20} color="#aaa" /> */}
        <TextInput placeholder="Search for chats & messages" style={styles.searchInput} />
      </View>
      <FlatList data={chatData} renderItem={renderItem} keyExtractor={(item) => item.id} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 16 },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#e9e9e9',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: { marginLeft: 10, flex: 1, fontSize: 14 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  textContent: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: '600' },
  lastMessage: { color: '#666', marginTop: 4, fontSize: 13 },
  typing: { color: '#ff9800', fontStyle: 'italic' },
  timeContainer: { alignItems: 'flex-end' },
  time: { color: '#aaa', fontSize: 12 },
  unreadDot: {
    width: 10,
    height: 10,
    backgroundColor: '#ff9800',
    borderRadius: 5,
    marginTop: 4,
  },
});

export default MessageList;
