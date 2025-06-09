import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity } from "react-native";
import { colors } from "../../utils";
import { base_url } from '../../utils/base_url';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Notification = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const response = await fetch(`${base_url}/user/getNotifications?read=false&offset=0&limit=10`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        
        const data = await response.json();
        const formattedData = data.map(item => ({
          id: item.id,
          description: item.description,
          title: item.title,
          time: item.time,
          date: item.date,
          read: item.read,
        }));
        setNotifications(formattedData);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    fetchCardData();
  }, []);

  const handleToggleReadStatus = async (id) => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const notification = notifications.find(n => n.id === id);
      
      await fetch(`${base_url}/user/updateNotification/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: !notification.read })
      });

      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === id
            ? { ...notification, read: !notification.read }
            : notification
        )
      );
    } catch (error) {
      console.error('Error updating notification status:', error);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "All") return true;
    if (activeTab === "Read") return notification.read;
    if (activeTab === "Unread") return !notification.read;
  });

  const groupedNotifications = [
    {
      title: "Today",
      data: filteredNotifications.filter((notification) => notification.date === "Today"),
    },
    {
      title: "Yesterday",
      data: filteredNotifications.filter((notification) => notification.date === "Yesterday"),
    },
  ];

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={styles.notificationCard}
      onPress={() => handleToggleReadStatus(item.id)}
    >
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationDescription}>{item.description}</Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
      <View style={styles.notificationIcon}>
        <Text style={styles.iconText}>🔔</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }) => (
    <Text style={styles.dateHeader}>{section.title}</Text>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>

      <View style={styles.tabBar}>
        {["All", "Read", "Unread"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
            ]}
            onPress={() => {
              setActiveTab(tab);
              setOffset(0); // Reset offset when changing tabs
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <SectionList
        sections={groupedNotifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNotification}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        onEndReached={() => setOffset(prev => prev + limit)}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  tab: {
    flex: 1, // Equal size for all tabs
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: colors.btncolor, // Purple background for active tab
  },
  tabText: {
    fontSize: 14,
    color: colors.fontMainColor,
    fontWeight: "bold",
  },
  activeTabText: {
    color: colors.white, // White text for active tab
  },
  list: {
    paddingBottom: 20,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.fontMainColor,
    marginBottom: 10,
    justifyContent: "center",
    alignSelf: "center",
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "#F9F9F9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    elevation: 2,
  },
  notificationContent: {
    flex: 1,
    marginRight: 10,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  notificationDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: "#AAA",
  },
  notificationIcon: {
    backgroundColor: "#FFD700",
    borderRadius: 25,
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 18,
  },
});

export default Notification;
