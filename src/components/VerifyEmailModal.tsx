import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axiosInstance from '../utils/axiosInstance';
import Toast from 'react-native-toast-message';

interface VerifyEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

const VerifyEmailModal: React.FC<VerifyEmailModalProps> = ({ isOpen, onClose, email }) => {
  const navigation = useNavigation();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const scaleAnim = new Animated.Value(0.9);
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    if (isOpen) {
      // Animate modal entrance
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto redirect to login after 5 seconds
      const redirectTimer = setTimeout(() => {
        handleClose();
        // @ts-ignore
        navigation.navigate('Login');
      }, 5000);

      return () => clearTimeout(redirectTimer);
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [isOpen]);

  const handleResendEmail = async () => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: '❌ Lỗi',
        text2: 'Không tìm thấy email',
      });
      return;
    }

    setIsResending(true);
    setResendSuccess(false);

    try {
      await axiosInstance.post('/auth/resend-verification', { email });
      setResendSuccess(true);
      Toast.show({
        type: 'success',
        text1: '✅ Thành công',
        text2: 'Email xác thực đã được gửi lại!',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi gửi lại email';
      Toast.show({
        type: 'error',
        text1: '❌ Lỗi',
        text2: errorMessage,
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Pressable
        className="flex-1 bg-black/40 items-center justify-center px-6"
        onPress={handleClose}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }}
        >
          <Pressable
            className="bg-white rounded-3xl w-full max-w-md"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <TouchableOpacity
              onPress={handleClose}
              className="absolute top-4 right-4 w-8 h-8 items-center justify-center rounded-full bg-gray-100 z-10"
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>

            {/* Content */}
            <View className="p-6">
              {/* Icon & Title */}
              <View className="items-center mb-5">
                <View className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full items-center justify-center mb-4 shadow-lg">
                  <Ionicons name="mail" size={32} color="#fff" />
                </View>
                <Text className="text-2xl font-bold text-gray-900 mb-1 text-center">
                  Kiểm tra Email
                </Text>
                <Text className="text-sm text-gray-600 text-center">
                  Chúng tôi đã gửi link xác thực đến
                </Text>
              </View>

              {/* Email display */}
              <View className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
                <View className="flex-row items-center justify-center">
                  <Ionicons name="send" size={16} color="#f97316" />
                  <Text className="ml-2 font-semibold text-orange-700 text-sm text-center">
                    {email}
                  </Text>
                </View>
              </View>

              {/* Success Message */}
              {resendSuccess && (
                <View className="mb-4 p-3 rounded-xl flex-row items-center bg-green-50 border border-green-200">
                  <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                  <Text className="ml-2 text-sm text-green-700">Đã gửi lại email!</Text>
                </View>
              )}

              {/* Actions */}
              <View className="space-y-2">
                <TouchableOpacity
                  onPress={handleResendEmail}
                  disabled={isResending}
                  className={`w-full py-3.5 px-4 rounded-xl items-center justify-center ${
                    isResending ? 'bg-gray-300' : 'bg-gradient-to-r from-orange-500 to-red-500'
                  }`}
                  style={{
                    backgroundColor: isResending ? '#d1d5db' : '#f97316',
                  }}
                  activeOpacity={0.7}
                >
                  {isResending ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="#fff" />
                      <Text className="ml-2 text-white font-semibold text-sm">Đang gửi...</Text>
                    </View>
                  ) : (
                    <Text className="text-white font-semibold text-sm">🔄 Gửi lại email</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleClose}
                  className="w-full py-3.5 px-4 rounded-xl bg-gray-100 items-center justify-center"
                  activeOpacity={0.7}
                >
                  <Text className="text-gray-600 font-semibold text-sm">Đóng</Text>
                </TouchableOpacity>
              </View>

              {/* Help text */}
              <Text className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
                Kiểm tra cả thư mục spam. Link có hiệu lực trong 24 giờ.
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default VerifyEmailModal;
