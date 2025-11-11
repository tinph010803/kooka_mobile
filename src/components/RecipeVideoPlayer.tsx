import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Dimensions,
  Animated,
  ScrollView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import * as ScreenOrientation from "expo-screen-orientation";

interface Instruction {
  title: string;
  subTitle: string[];
  images: string[];
}

interface RecipeVideoPlayerProps {
  videoUrl: string;
  recipeName: string;
  instructions: Instruction[];
  screenWidth: number;
}

export default function RecipeVideoPlayer({
  videoUrl,
  recipeName,
  instructions,
  screenWidth,
}: RecipeVideoPlayerProps) {
  const [videoLoading, setVideoLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInstructionsPanel, setShowInstructionsPanel] = useState(false);
  const [fullscreenOpenSteps, setFullscreenOpenSteps] = useState<number[]>([]);
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));
  const panelAnimation = useRef(new Animated.Value(0)).current;
  
  const screenHeight = dimensions.height;

  // Convert Rumble URL to embed URL
  const getRumbleEmbedUrl = (url: string): string => {
    if (url.includes('/embed/')) {
      return url;
    }

    const videoIdMatch = url.match(/rumble\.com\/([a-zA-Z0-9]+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      const videoId = videoIdMatch[1];
      const pubMatch = url.match(/[?&]mref=([^&]+)/);
      const pubParam = pubMatch ? `?pub=${pubMatch[1]}` : '';
      return `https://rumble.com/embed/${videoId}/${pubParam}`;
    }
    return url;
  };

  // Generate HTML for Rumble embed
  const generateRumbleHTML = (videoUrl: string, hideFullscreenButton: boolean = false): string => {
    const embedUrl = getRumbleEmbedUrl(videoUrl);
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover">
  <title>Video Player</title>
  <style>
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box;
      -webkit-user-select: none;
      user-select: none;
    }
    body, html { 
      background: #000;
      overflow: hidden; 
      height: 100vh; 
      width: 100vw;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
    .video-container {
      width: 100vw;
      height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    iframe.rumble {
      width: 100vw;
      height: 100vh;
      border: none;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      object-fit: cover;
      ${hideFullscreenButton ? 'pointer-events: auto;' : ''}
    }
  </style>
</head>
<body>
  <div class="video-container">
    <iframe 
      class="rumble" 
      width="100%" 
      height="100%" 
      src="${embedUrl}" 
      frameborder="0" 
      ${hideFullscreenButton ? '' : 'allowfullscreen'}>
    </iframe>
  </div>
</body>
</html>
    `;
  };

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    const handleOrientation = async () => {
      if (isFullscreen) {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
      } else {
        await ScreenOrientation.unlockAsync();
      }
    };

    handleOrientation();

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (isFullscreen) {
      setShowInstructionsPanel(false);
      setFullscreenOpenSteps([]);
      panelAnimation.setValue(0);
    }
  };

  const toggleInstructionsPanel = () => {
    const toValue = showInstructionsPanel ? 0 : 1;
    
    Animated.spring(panelAnimation, {
      toValue,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
    
    setShowInstructionsPanel(!showInstructionsPanel);
  };

  const toggleFullscreenStep = (index: number) => {
    setFullscreenOpenSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'fullscreen') {
        setIsFullscreen(data.value);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  return (
    <>
      {/* Normal Video Player */}
      <View className="bg-white rounded-2xl shadow-md border-2 border-orange-100 overflow-hidden mb-6">
        <View className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 border-b border-orange-200">
          <View className="flex-row items-center gap-2">
            <Ionicons name="play-circle" size={20} color="#F97316" />
            <Text className="text-gray-800 text-base font-bold">
              Video hướng dẫn
            </Text>
          </View>
        </View>

        <View className="p-4">
          <View
            className="bg-black rounded-lg overflow-hidden relative"
            style={{ height: (screenWidth - 32) * 9 / 16 }}
          >
            {videoLoading && (
              <View className="absolute inset-0 items-center justify-center bg-gray-900 z-10">
                <ActivityIndicator size="large" color="#F97316" />
                <Text className="text-white mt-2">Đang tải video...</Text>
              </View>
            )}

            <WebView
              source={{ html: generateRumbleHTML(videoUrl, true) }}
              style={{ flex: 1, backgroundColor: "#000" }}
              allowsFullscreenVideo={false}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              scalesPageToFit={true}
              scrollEnabled={false}
              bounces={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              onMessage={handleWebViewMessage}
              onLoadStart={() => setVideoLoading(true)}
              onLoadEnd={() => setVideoLoading(false)}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error("WebView error:", nativeEvent);
                setVideoLoading(false);
              }}
            />

            {/* Custom Fullscreen Button */}
            <TouchableOpacity
              onPress={toggleFullscreen}
              className="absolute bottom-2 right-2 bg-black/70 p-2.5 rounded-lg z-20"
              activeOpacity={0.8}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <Ionicons name="expand" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Fullscreen Video Modal */}
      <Modal
        visible={isFullscreen}
        animationType="fade"
        onRequestClose={toggleFullscreen}
        supportedOrientations={['landscape', 'portrait']}
        transparent={false}
      >
        <View style={{
          flex: 1,
          backgroundColor: '#000',
        }}>
          <StatusBar hidden={true} translucent={true} backgroundColor="#000" />

          {/* Close Button */}
          <TouchableOpacity
            onPress={toggleFullscreen}
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              width: 40,
              height: 40,
              backgroundColor: 'rgba(0,0,0,0.6)',
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>

          {/* Toggle Instructions Button */}
          <TouchableOpacity
            onPress={toggleInstructionsPanel}
            style={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              width: 48,
              height: 48,
              backgroundColor: 'rgba(249, 115, 22, 0.9)',
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              elevation: 5,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name={showInstructionsPanel ? "close" : "list"}
              size={24}
              color="#FFF"
            />
          </TouchableOpacity>

          {/* Fullscreen Video */}
          <Animated.View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            flex: 1,
            width: panelAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [dimensions.width, dimensions.width * 0.6],
            }),
          }}>
            {videoLoading && (
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#111',
                zIndex: 10,
              }}>
                <ActivityIndicator size="large" color="#F97316" />
                <Text style={{ color: '#FFF', marginTop: 8 }}>Đang tải video...</Text>
              </View>
            )}

            <WebView
              source={{ html: generateRumbleHTML(videoUrl, false) }}
              style={{
                flex: 1,
                width: '100%',
                height: '100%',
                backgroundColor: '#000',
              }}
              allowsFullscreenVideo={true}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              scalesPageToFit={true}
              scrollEnabled={false}
              bounces={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              onMessage={handleWebViewMessage}
              onLoadStart={() => setVideoLoading(true)}
              onLoadEnd={() => setVideoLoading(false)}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error("WebView error:", nativeEvent);
                setVideoLoading(false);
              }}
            />
          </Animated.View>

          {/* Instructions Side Panel */}
          <Animated.View
            pointerEvents={showInstructionsPanel ? 'auto' : 'none'}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: dimensions.width * 0.4,
              height: screenHeight,
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              borderLeftWidth: 2,
              borderLeftColor: 'rgba(249, 115, 22, 0.5)',
              zIndex: 40,
              transform: [{
                translateX: panelAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [dimensions.width * 0.4, 0],
                }),
              }],
            }}
          >
            {/* Panel Header */}
            <View style={{
              paddingTop: 20,
              paddingHorizontal: 12,
              paddingBottom: 12,
              borderBottomWidth: 2,
              borderBottomColor: 'rgba(249, 115, 22, 0.5)',
              backgroundColor: 'rgba(249, 115, 22, 0.1)',
            }}>
              <Text style={{
                color: '#F97316',
                fontSize: 15,
                fontWeight: 'bold',
                marginBottom: 4,
              }} numberOfLines={2}>
                {recipeName}
              </Text>
              <Text style={{
                color: '#FFF',
                fontSize: 13,
                fontWeight: '600',
              }}>
                Các bước nấu ăn
              </Text>
            </View>

            {/* Instructions List - Accordion Style */}
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 12 }}
            >
              {instructions.map((instruction, index) => (
                <View
                  key={index}
                  style={{
                    marginBottom: 10,
                    backgroundColor: 'rgba(17, 17, 17, 0.8)',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: fullscreenOpenSteps.includes(index)
                      ? 'rgba(249, 115, 22, 0.6)'
                      : 'rgba(249, 115, 22, 0.2)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Step Header - Clickable */}
                  <TouchableOpacity
                    onPress={() => toggleFullscreenStep(index)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 10,
                      backgroundColor: fullscreenOpenSteps.includes(index)
                        ? 'rgba(249, 115, 22, 0.15)'
                        : 'transparent',
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: '#F97316',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 10,
                    }}>
                      <Text style={{
                        color: '#FFF',
                        fontSize: 13,
                        fontWeight: 'bold',
                      }}>
                        {index + 1}
                      </Text>
                    </View>
                    <Text style={{
                      color: '#FFF',
                      fontSize: 13,
                      fontWeight: '600',
                      flex: 1,
                      lineHeight: 18,
                    }}>
                      {instruction.title}
                    </Text>
                    <Ionicons
                      name={fullscreenOpenSteps.includes(index) ? "chevron-up" : "chevron-down"}
                      size={18}
                      color="#F97316"
                    />
                  </TouchableOpacity>

                  {/* Step Details - Expandable */}
                  {fullscreenOpenSteps.includes(index) && (
                    <View style={{
                      paddingHorizontal: 12,
                      paddingTop: 8,
                      paddingBottom: 12,
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      borderTopWidth: 1,
                      borderTopColor: 'rgba(249, 115, 22, 0.2)',
                    }}>
                      {instruction.subTitle.map((step, stepIndex) => (
                        <View
                          key={stepIndex}
                          style={{
                            flexDirection: 'row',
                            marginTop: stepIndex > 0 ? 6 : 0,
                            paddingLeft: 4,
                          }}
                        >
                          <Text style={{
                            color: '#F97316',
                            fontSize: 11,
                            marginRight: 6,
                            marginTop: 2,
                          }}>
                            •
                          </Text>
                          <Text style={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: 11,
                            flex: 1,
                            lineHeight: 16,
                          }}>
                            {step}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}
