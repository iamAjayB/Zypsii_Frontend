import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Text
} from 'react-native';
import SwiperFlatList from 'react-native-swiper-flatlist';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/Ionicons';
import { TextDefault } from '../../components';
import { colors } from '../../utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { base_url } from '../../utils/base_url';
import FollowButton from '../../components/Follow/FollowButton';

const { height, width } = Dimensions.get('window');

function ShortsScreen() {
  const [all_shorts, setAllShorts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchShorts = async () => {
    try {
      setIsLoading(true);
      const accessToken = await AsyncStorage.getItem('accessToken');
      
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
      
      if (shortsData.status && Array.isArray(shortsData.data)) {
        const shortsList = shortsData.data.map(short => ({
          id: short._id,
          type: 'short',
          title: short.title,
          description: short.description,
          videoUrl: short.videoUrl,
          thumbnailUrl: short.thumbnailUrl,
          createdBy: short.createdBy,
          viewsCount: short.viewsCount || 0,
          likesCount: short.likesCount || 0,
          commentsCount: short.commentsCount || 0,
          createdAt: short.createdAt,
          updatedAt: short.updatedAt
        }));
        
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
  }, []);

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
        keyExtractor={(item) => item.id}
        vertical
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        decelerationRate="fast"
        onChangeIndex={({ index }) => {
          // Stop all videos when swiping
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
                          // Remove any existing video elements
                          var existingVideos = document.getElementsByTagName('video');
                          for(var i = 0; i < existingVideos.length; i++) {
                            existingVideos[i].remove();
                          }

                          // Create new video element
                          var video = document.createElement('video');
                          video.src = '${videoSource.uri}';
                          video.style.width = '100vw';
                          video.style.height = '100vh';
                          video.style.objectFit = 'cover';
                          video.style.position = 'fixed';
                          video.style.top = '0';
                          video.style.left = '0';
                          video.style.right = '0';
                          video.style.bottom = '0';
                          video.style.backgroundColor = 'black';
                          video.loop = true;
                          video.muted = false;
                          video.playsInline = true;
                          video.setAttribute('loop', true);
                          video.setAttribute('playsinline', true);
                          video.setAttribute('webkit-playsinline', true);
                          video.setAttribute('x5-playsinline', true);
                          video.setAttribute('x5-video-player-type', 'h5');
                          video.setAttribute('x5-video-player-fullscreen', true);
                          video.setAttribute('x5-video-orientation', 'portraint');
                          video.removeAttribute('controls');
                          video.style.pointerEvents = 'none';

                          // Function to handle video looping
                          function handleVideoLoop() {
                            if (video.currentTime >= video.duration - 0.1) {
                              video.currentTime = 0;
                              video.play().catch(function(error) {
                                console.log("Loop playback failed:", error);
                              });
                            }
                          }

                          // Add event listeners for better playback control
                          video.addEventListener('timeupdate', handleVideoLoop);
                          
                          video.addEventListener('ended', function() {
                            video.currentTime = 0;
                            video.play().catch(function(error) {
                              console.log("Playback failed:", error);
                            });
                          });

                          video.addEventListener('pause', function() {
                            video.play().catch(function(error) {
                              console.log("Playback failed:", error);
                            });
                          });

                          video.addEventListener('error', function(e) {
                            console.log("Video error:", e);
                            video.load();
                            video.play().catch(function(error) {
                              console.log("Playback failed:", error);
                            });
                          });

                          // Clear body and append video
                          document.body.innerHTML = '';
                          document.body.style.margin = '0';
                          document.body.style.padding = '0';
                          document.body.style.overflow = 'hidden';
                          document.body.style.backgroundColor = 'black';
                          document.body.appendChild(video);

                          // Add styles to hide all controls
                          var style = document.createElement('style');
                          style.type = 'text/css';
                          style.innerHTML = \`
                            video::-webkit-media-controls { display: none !important; }
                            video::-webkit-media-controls-enclosure { display: none !important; }
                            video::-webkit-media-controls-panel { display: none !important; }
                            video::-webkit-media-controls-play-button { display: none !important; }
                            video::-webkit-media-controls-start-playback-button { display: none !important; }
                            video::-webkit-media-controls-overlay-play-button { display: none !important; }
                            video::-webkit-media-controls-timeline { display: none !important; }
                            video::-webkit-media-controls-current-time-display { display: none !important; }
                            video::-webkit-media-controls-time-remaining-display { display: none !important; }
                            video::-webkit-media-controls-time-control { display: none !important; }
                            video::-webkit-media-controls-mute-button { display: none !important; }
                            video::-webkit-media-controls-toggle-closed-captions-button { display: none !important; }
                            video::-webkit-media-controls-volume-slider { display: none !important; }
                            video::-webkit-media-controls-fullscreen-button { display: none !important; }
                            video::-webkit-media-controls-rewind-button { display: none !important; }
                            video::-webkit-media-controls-return-to-realtime-button { display: none !important; }
                            video::-webkit-media-controls-toggle-closed-captions-button { display: none !important; }
                            .play-button, .play-icon, .video-controls { display: none !important; }
                          \`;
                          document.head.appendChild(style);

                          // Function to ensure video plays
                          function ensurePlay() {
                            if (video.paused) {
                              video.play().catch(function(error) {
                                console.log("Playback failed:", error);
                                setTimeout(ensurePlay, 1000);
                              });
                            }
                          }

                          // Start playing and set up periodic checks
                          video.play().catch(function(error) {
                            console.log("Initial playback failed:", error);
                            setTimeout(ensurePlay, 1000);
                          });

                          // Set up periodic check to ensure video is playing
                          setInterval(ensurePlay, 2000);

                          // Force play on user interaction
                          document.addEventListener('click', function() {
                            video.play().catch(function(error) {
                              console.log("Click playback failed:", error);
                            });
                          });

                          // Force play on touch
                          document.addEventListener('touchstart', function() {
                            video.play().catch(function(error) {
                              console.log("Touch playback failed:", error);
                            });
                          });
                        `;
                        this.webview.injectJavaScript(autoPlayScript);
                      }}
                      ref={(ref) => (this.webview = ref)}
                      onError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.warn('WebView error: ', nativeEvent);
                      }}
                      renderLoading={() => (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator size="large" color={colors.btncolor} />
                        </View>
                      )}
                    />
                  </View>
                ) : (
                  <View style={styles.errorContainer}>
                    <Image
                      source={{ uri: item.thumbnailUrl }}
                      style={styles.thumbnailImage}
                      resizeMode="cover"
                    />
                    <View style={styles.errorMessageContainer}>
                      <TextDefault textColor={colors.white} H6>
                        {!item.videoUrl ? 'No video available' : 'Unsupported video format'}
                      </TextDefault>
                    </View>
                  </View>
                )}
              </View>

              {/* Right side interaction buttons */}
              <View style={styles.interactionButtonsContainer}>
                <TouchableOpacity style={styles.interactionButton}>
                  <Icon name="heart-outline" size={28} color={colors.white} />
                  <TextDefault textColor={colors.white} H6 style={styles.interactionCount}>
                    {item.likesCount}
                  </TextDefault>
                </TouchableOpacity>

                <TouchableOpacity style={styles.interactionButton}>
                  <Icon name="chatbubble-outline" size={28} color={colors.white} />
                  <TextDefault textColor={colors.white} H6 style={styles.interactionCount}>
                    {item.commentsCount}
                  </TextDefault>
                </TouchableOpacity>

                <TouchableOpacity style={styles.interactionButton}>
                  <Icon name="share-social-outline" size={28} color={colors.white} />
                  <TextDefault textColor={colors.white} H6 style={styles.interactionCount}>
                    {item.shareCount || 0}
                  </TextDefault>
                </TouchableOpacity>
              </View>

              {/* Video info overlay */}
              <View style={styles.videoInfoOverlay}>
                <View style={styles.userInfoContainer}>
                  <View style={styles.userInfo}>
                    <TextDefault textColor={colors.white} H5 bold numberOfLines={2} style={styles.videoTitle}>
                      {item.title}
                    </TextDefault>
                    <TextDefault textColor={colors.white} H6 numberOfLines={2} style={styles.videoDescription}>
                      {item.description}
                    </TextDefault>
                  </View>
                  <View style={styles.followButtonContainer}>
                    <FollowButton userId={item.createdBy} />
                  </View>
                </View>
              </View>
            </View>
          );
        }}
      />
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
    height: height,
    width: width,
    position: 'relative',
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
    width: width,
    height: height,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.black,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  errorMessageContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  interactionButtonsContainer: {
    position: 'absolute',
    right: 10,
    bottom: 100,
    alignItems: 'center',
  },
  interactionButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  interactionCount: {
    marginTop: 5,
  },
  videoInfoOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 10,
    right: 80,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  userInfo: {
    flex: 1,
  },
  videoTitle: {
    marginBottom: 5,
  },
  videoDescription: {
    opacity: 0.8,
  },
  followButtonContainer: {
    marginLeft: 10,
  },
});

export default ShortsScreen; 