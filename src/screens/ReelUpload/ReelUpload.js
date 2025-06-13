import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../utils";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import styles from "./Styles";
import { base_url } from "../../utils/base_url";
import NotificationService from "../../services/NotificationService";
import ContentTypeModal from "../../components/ContentTypeModal/ContentTypeModal";
import { useToast } from '../../context/ToastContext';

function ReelUpload() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState(null);
  const [showContentTypeModal, setShowContentTypeModal] = useState(true);
  const [contentType, setContentType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const { showToast } = useToast();

  useEffect(() => {
    setShowContentTypeModal(true);
  }, []);

  const handleContentTypeSelect = (type) => {
    setContentType(type);
    setShowContentTypeModal(false);
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const pickVideo = async () => {
    Alert.alert(
      "Select Media",
      "Choose an option",
      [
        {
          text: "Camera",
          onPress: () => openCamera(),
        },
        {
          text: "Gallery",
          onPress: () => openGallery(),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted) {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 60,
      });

      if (!result.canceled) {
        setVideo(result.assets[0]);
      }
    } else {
      showToast("You need to allow camera access to record videos.", "error");
    }
  };

  const openGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 60,
      });

      if (!result.canceled) {
        setVideo(result.assets[0]);
      }
    } else {
      showToast("You need to allow access to your media library.", "error");
    }
  };

  const handleSubmit = async () => {
    if (!video) {
      showToast("Please select a video to upload.", "error");
      return;
    }
  
    try {
      setIsLoading(true);
      const accessToken = await AsyncStorage.getItem('accessToken');

      if (!accessToken) {
        showToast("You need to be logged in to submit.", "error");
        setIsLoading(false);
        return;
      }

      const uploadFormData = new FormData();
      const fileUri = video.uri.replace('file://', '');
      
      uploadFormData.append('mediaFile', {
        uri: video.uri,
        type: 'video/mp4',
        name: 'video.mp4'
      });

      try {
        const uploadResponse = await fetch(`${base_url}/uploadFile?mediaType=reel`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
          body: uploadFormData,
        });

        if (uploadResponse.status === 413) {
          showToast("The file is too large. Please try uploading a smaller file.", "error");
          setIsLoading(false);
          return;
        }

        let uploadResponseData;
        try {
          const responseText = await uploadResponse.text();
          uploadResponseData = JSON.parse(responseText);
        } catch (error) {
          console.error('Error parsing response:', error);
          showToast("Failed to process the upload response. Please try again.", "error");
          setIsLoading(false);
          return;
        }

        if (!uploadResponseData.status) {
          showToast(uploadResponseData.message || "Failed to upload file", "error");
          setIsLoading(false);
          return;
        }

        if (!uploadResponseData.urls || !uploadResponseData.urls[0]) {
          showToast("No file URL returned from upload", "error");
          setIsLoading(false);
          return;
        }

        const reelFormData = new FormData();
        reelFormData.append('reelTitle', title);
        reelFormData.append('reelType', 'Public');
        reelFormData.append('mediaType', 'video');
        reelFormData.append('mediaUrl', uploadResponseData.urls[0]);
        reelFormData.append('tags[]', 'new');

        const response = await fetch(`${base_url}/reel/create`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
          body: reelFormData,
        });

        const responseData = await response.json();

        if (response.ok) {
          showToast("Your reel was successfully created!", "success");
          navigation.goBack();
        } else {
          console.error("Error creating reel. Status:", response.status);
          console.error("Error response data:", responseData);
          showToast(responseData.message || "There was an error creating your reel.", "error");
        }
      } catch (error) {
        console.error("Network error:", error);
        showToast(
          "Please check your internet connection and try again. If the problem persists, try uploading a smaller file.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error in creating reel:", error);
      showToast("There was an error creating your reel. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const user = JSON.parse(userData);
      
      const expoPushToken = await AsyncStorage.getItem('expoPushToken');
      
      if (!expoPushToken) {
        showToast("No push token found. Please make sure you're logged in.", "error");
        return;
      }

      await NotificationService.sendReelNotification(user.fullName, expoPushToken);
      showToast("Test notification sent!", "success");
    } catch (error) {
      console.error("Error sending test notification:", error);
      showToast("Failed to send test notification", "error");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ContentTypeModal
        visible={showContentTypeModal}
        onClose={() => setShowContentTypeModal(false)}
        onSelectType={handleContentTypeSelect}
      />

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color={colors.fontMainColor} />
        </TouchableOpacity>
      </View>

      {contentType && (
        <ScrollView>
          <TouchableOpacity 
            style={styles.videoContainer} 
            onPress={pickVideo}
          >
            {video ? (
              <Image 
                source={{ uri: video.uri }} 
                style={styles.selectedVideo} 
              />
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons 
                  name="videocam"
                  size={50} 
                  color={colors.btncolor} 
                />
                <Text style={styles.placeholderText}>
                  Tap to add video
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.titleInput}
              placeholder="Add a title..."
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Add a description..."
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Share</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

export default ReelUpload;
