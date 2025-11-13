import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  ArrowLeft,
  Camera,
  Edit,
  Lock,
  ChevronRight,
  X,
  Eye,
  EyeOff,
} from "lucide-react-native";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { updateProfile } from "../redux/slices/userSlice";
import { changePassword } from "../redux/slices/authSlice";
import * as ImagePicker from "expo-image-picker";

interface MenuItemProps {
  icon: any;
  label: string;
  onPress?: () => void;
  showAvatar?: boolean;
  avatar?: string | null;
  initials?: string;
}

const AccountManagementPage: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { profile, loading } = useAppSelector((state) => state.user);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangeAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Lỗi", "Cần quyền truy cập thư viện ảnh");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setAvatarPreview(base64);
      if (user?._id) {
        try {
          await dispatch(updateProfile({ userId: user._id, data: { avatar: base64 } })).unwrap();
          Alert.alert("Thành công", "Đã cập nhật ảnh đại diện");
        } catch (error: any) {
          Alert.alert("Lỗi", error || "Không thể cập nhật ảnh đại diện");
        }
      }
    }
  };

  const handleUpdateInfo = async () => {
    if (!user?._id) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng");
      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ họ và tên");
      return;
    }

    try {
      await dispatch(updateProfile({ 
        userId: user._id, 
        data: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
        }
      })).unwrap();
      
      setShowEditModal(false);
      Alert.alert("Thành công", "Đã cập nhật thông tin tài khoản");
      
      // Reset form after successful update
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
      });
    } catch (error: any) {
      Alert.alert("Lỗi", error || "Không thể cập nhật thông tin");
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    // Reset form data when closing without saving
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
    });
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu hiện tại");
      return;
    }

    if (!passwordData.newPassword.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu mới");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }

    try {
      await dispatch(changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })).unwrap();

      Alert.alert("Thành công", "Đã đổi mật khẩu thành công");
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      Alert.alert("Lỗi", error || "Không thể đổi mật khẩu");
    }
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    // Reset password data when closing without saving
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleOpenEditModal = () => {
    // Initialize form with current profile data when opening
    setFormData({
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      email: user?.email || "",
    });
    setShowEditModal(true);
  };

  const getUserInitials = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || "U";
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="bg-white flex-row items-center px-4 py-4  border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={24} color="#000000" />
        </TouchableOpacity>
        <Text className="text-gray-900 text-xl font-bold ml-4">Quản lý tài khoản</Text>
      </View>

      <ScrollView className="flex-1">
        <MenuItem
          icon={Camera}
          label="Đổi ảnh đại diện"
          onPress={handleChangeAvatar}
          showAvatar
          avatar={avatarPreview || profile?.avatar}
          initials={getUserInitials()}
        />
        <MenuItem
          icon={Edit}
          label="Thay đổi thông tin"
          onPress={handleOpenEditModal}
        />
        <MenuItem
          icon={Lock}
          label="Đổi mật khẩu"
          onPress={() => setShowPasswordModal(true)}
        />
      </ScrollView>

      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseEditModal}
      >
        <View className="flex-1 justify-end bg-black/50">
          <TouchableOpacity 
            className="flex-1"
            activeOpacity={1}
            onPress={handleCloseEditModal}
          />
          <View className="bg-white rounded-t-3xl px-6 py-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-gray-900 text-xl font-bold">Thông tin tài khoản</Text>
              <TouchableOpacity onPress={handleCloseEditModal}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-gray-600 text-sm mb-2">First Name</Text>
              <TextInput
                value={formData.firstName}
                onChangeText={(text) => {
                  setFormData({
                    ...formData,
                    firstName: text,
                  });
                }}
                className="bg-gray-100 text-gray-900 px-4 py-3.5 rounded-lg text-base border border-gray-200"
                placeholderTextColor="#9CA3AF"
                placeholder="Enter your first name"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-600 text-sm mb-2">Last Name</Text>
              <TextInput
                value={formData.lastName}
                onChangeText={(text) => {
                  setFormData({
                    ...formData,
                    lastName: text,
                  });
                }}
                className="bg-gray-100 text-gray-900 px-4 py-3.5 rounded-lg text-base border border-gray-200"
                placeholderTextColor="#9CA3AF"
                placeholder="Enter your last name"
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-600 text-sm mb-2">Email</Text>
              <TextInput
                value={formData.email}
                editable={false}
                className="bg-gray-100 text-gray-500 px-4 py-3.5 rounded-lg text-base border border-gray-200"
              />
            </View>

            <View className="flex-row gap-3 pb-2">
              <TouchableOpacity
                onPress={handleCloseEditModal}
                className="flex-1 bg-gray-200 py-3.5 rounded-lg"
                disabled={loading}
              >
                <Text className="text-gray-900 text-center font-bold text-base">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateInfo}
                className="flex-1 bg-green-500 py-3.5 rounded-lg"
                disabled={loading}
                style={{ opacity: loading ? 0.6 : 1 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-center font-bold text-base">Cập nhật</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClosePasswordModal}
      >
        <View className="flex-1 justify-end bg-black/50">
          <TouchableOpacity 
            className="flex-1"
            activeOpacity={1}
            onPress={handleClosePasswordModal}
          />
          <View className="bg-white rounded-t-3xl px-6 py-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-gray-900 text-xl font-bold">Thay đổi mật khẩu</Text>
              <TouchableOpacity onPress={handleClosePasswordModal}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-gray-600 text-sm mb-2">Mật khẩu hiện tại</Text>
              <View className="relative">
                <TextInput
                  value={passwordData.currentPassword}
                  onChangeText={(text) =>
                    setPasswordData({ ...passwordData, currentPassword: text })
                  }
                  secureTextEntry={!showCurrentPassword}
                  className="bg-gray-100 text-gray-900 px-4 py-3.5 rounded-lg text-base border border-gray-200 pr-12"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-3.5"
                >
                  {showCurrentPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-gray-600 text-sm mb-2">Mật khẩu mới</Text>
              <View className="relative">
                <TextInput
                  value={passwordData.newPassword}
                  onChangeText={(text) =>
                    setPasswordData({ ...passwordData, newPassword: text })
                  }
                  secureTextEntry={!showNewPassword}
                  className="bg-gray-100 text-gray-900 px-4 py-3.5 rounded-lg text-base border border-gray-200 pr-12"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-3.5"
                >
                  {showNewPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-gray-600 text-sm mb-2">Xác nhận mật khẩu mới</Text>
              <View className="relative">
                <TextInput
                  value={passwordData.confirmPassword}
                  onChangeText={(text) =>
                    setPasswordData({ ...passwordData, confirmPassword: text })
                  }
                  secureTextEntry={!showConfirmPassword}
                  className="bg-gray-100 text-gray-900 px-4 py-3.5 rounded-lg text-base border border-gray-200 pr-12"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-3.5"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row gap-3 pb-2">
              <TouchableOpacity
                onPress={handleClosePasswordModal}
                className="flex-1 bg-gray-200 py-3.5 rounded-lg"
                disabled={loading}
              >
                <Text className="text-gray-900 text-center font-bold text-base">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleChangePassword}
                className="flex-1 bg-green-500 py-3.5 rounded-lg"
                disabled={loading}
                style={{ opacity: loading ? 0.6 : 1 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-center font-bold text-base">Cập nhật</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const MenuItem: React.FC<MenuItemProps> = ({ 
  icon: Icon, 
  label, 
  onPress, 
  showAvatar = false,
  avatar,
  initials 
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between py-5 px-6 bg-white border-b border-gray-200"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        {showAvatar ? (
          <View className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 items-center justify-center overflow-hidden border-2 ">
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-white text-sm font-bold">
                {initials}
              </Text>
            )}
          </View>
        ) : (
          <Icon size={22} color="#374151" />
        )}
        <Text className="text-gray-900 text-base ml-4">{label}</Text>
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
};

export default AccountManagementPage;
