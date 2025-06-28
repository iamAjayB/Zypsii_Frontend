import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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
import { useToast } from '../../context/ToastContext';
import { Picker } from '@react-native-picker/picker';

function PostUpload() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [postType, setPostType] = useState("Public");
  const navigation = useNavigation();
  const { showToast } = useToast();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const pickImage = async () => {
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.7,
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    } else {
      showToast("You need to allow camera access to take photos.", "error");
    }
  };

  const openGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.7,
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    } else {
      showToast("You need to allow access to your media library.", "error");
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      showToast("Please select an image to upload.", "error");
      return;
    }

    if (!title.trim()) {
      showToast("Please add a title for your post.", "error");
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
      const fileUri = image.uri.replace('file://', '');
      
      const fileExtension = fileUri.split('.').pop().toLowerCase();
      let mimeType = 'image/jpeg';
      
      if (fileExtension === 'png') {
        mimeType = 'image/png';
      } else if (fileExtension === 'gif') {
        mimeType = 'image/gif';
      } else if (fileExtension === 'webp') {
        mimeType = 'image/webp';
      }

      uploadFormData.append('mediaFile', {
        uri: image.uri,
        type: mimeType,
        name: `image.${fileExtension}`
      });

      try {
        const uploadResponse = await fetch(`${base_url}/uploadFile?mediaType=post`, {
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

        const postFormData = new FormData();
        postFormData.append('postTitle', title.trim());
        postFormData.append('postType', postType);
        postFormData.append('mediaType', 'image');
        postFormData.append('mediaUrl[]', uploadResponseData.urls[0]);
        postFormData.append('tags[]', 'new');
        if (description.trim()) {
          postFormData.append('postDescription', description.trim());
        }

        const response = await fetch(`${base_url}/post/create`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
          body: postFormData,
        });

        const responseData = await response.json();

        if (response.ok) {
          showToast(`Your ${postType.toLowerCase()} post was successfully created!`, "success");
          navigation.goBack();
        } else {
          console.error("Error creating post. Status:", response.status);
          console.error("Error response data:", responseData);
          showToast(responseData.message || "There was an error creating your post.", "error");
        }
      } catch (error) {
        console.error("Network error:", error);
        showToast(
          "Please check your internet connection and try again. If the problem persists, try uploading a smaller file.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error in creating post:", error);
      showToast("There was an error creating your post. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color={colors.fontMainColor} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <TouchableOpacity 
          style={styles.imageContainer} 
          onPress={pickImage}
        >
          {image ? (
            <Image 
              source={{ uri: image.uri }} 
              style={styles.selectedImage} 
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons 
                name="camera"
                size={50} 
                color={colors.btncolor} 
              />
              <Text style={styles.placeholderText}>
                Tap to add photo
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

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Post Type:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={postType}
              style={styles.picker}
              onValueChange={(itemValue) => setPostType(itemValue)}
            >
              <Picker.Item label="Public" value="Public" />
              <Picker.Item label="Followers Only" value="FollowersOnly" />
              <Picker.Item label="My Posts" value="my" />
            </Picker>
          </View>
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
    </SafeAreaView>
  );
}

export default PostUpload; 