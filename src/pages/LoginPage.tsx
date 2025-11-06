import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { ArrowLeft, Mail, Lock, CheckCircle, AlertCircle } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import FormInput from "../components/FormInput";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { LinearGradient } from "expo-linear-gradient";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { login, clearError } from "../redux/slices/authSlice";

interface LoginPageProps {
  onBack?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onBack }) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  
  // Get Redux state
  const { user, loading, error: authError } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    usernameOrEmail: "tin18",
    password: "123",
  });

  const [showSuccess, setShowSuccess] = useState(false);

  // Clear error khi component unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Navigate khi login thành công
  useEffect(() => {
    if (user && !loading) {
      setShowSuccess(true);
      setTimeout(() => {
        navigation.navigate("Home" as never);
      }, 1000);
    }
  }, [user, loading, navigation]);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Clear previous error
    dispatch(clearError());

    // Validate input
    if (!formData.usernameOrEmail || !formData.password) {
      return;
    }

    // Dispatch login action
    try {
      await dispatch(login({
        usernameOrEmail: formData.usernameOrEmail,
        password: formData.password,
      })).unwrap();
      // Success will be handled by useEffect
    } catch (err) {
      // Error will be shown from Redux state
      console.error('Login error:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={["#FFF7ED", "#FFFFFF", "#FEF2F2"]}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow p-4 justify-center"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {onBack && (
            <TouchableOpacity
              onPress={onBack}
              className="flex-row items-center mb-4"
              activeOpacity={0.7}
            >
              <ArrowLeft size={16} color="#4B5563" />
              <Text className="ml-2 text-sm text-gray-600">Quay lại</Text>
            </TouchableOpacity>
          )}
          <View className="bg-white rounded-xl p-5 shadow-lg">
            <View className="items-center mb-5">
              <LinearGradient
                colors={["#F97316", "#DC2626"]}
                className="w-12 h-12 rounded-xl items-center justify-center mb-3"
              >
                <Lock size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text className="text-2xl font-bold text-gray-900 mb-1">Chào mừng trở lại</Text>
              <Text className="text-sm text-gray-600">Đăng nhập vào tài khoản của bạn</Text>
            </View>

            {authError && (
              <View className="flex-row items-center bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <AlertCircle size={16} color="#991B1B" />
                <Text className="ml-2 text-sm text-red-800">{authError}</Text>
              </View>
            )}

            {showSuccess && (
              <View className="flex-row items-center bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <CheckCircle size={16} color="#166534" />
                <Text className="ml-2 text-sm text-green-800">Đăng nhập thành công!</Text>
              </View>
            )}

            <View className="mb-4">
              <FormInput
                label="Email hoặc Username"
                type="text"
                name="usernameOrEmail"
                value={formData.usernameOrEmail}
                onChange={handleInputChange}
                placeholder="john@example.com hoặc username"
                icon={Mail}
                required
              />

              <FormInput
                label="Mật khẩu"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                icon={Lock}
                required
              />

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.7}
                className="mt-2 rounded-lg overflow-hidden"
              >
                <LinearGradient
                  colors={loading ? ["#9CA3AF", "#9CA3AF"] : ["#F97316", "#DC2626"]}
                  className="py-3 px-4 items-center justify-center"
                >
                  {loading ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text className="text-sm font-semibold text-white ml-2">
                        Đang đăng nhập
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-sm font-semibold text-white">Đăng nhập</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View className="items-center mb-4">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate("ForgotPassword" as never)}
              >
                <Text className="text-sm font-medium text-orange-600 mb-3">
                  Quên mật khẩu?
                </Text>
              </TouchableOpacity>

              <View className="flex-row items-center">
                <Text className="text-sm text-gray-600">Chưa có tài khoản? </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate("Register" as never)}
                >
                  <Text className="text-sm font-medium text-orange-600">Đăng ký</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row items-center mb-4">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-3 text-xs text-gray-500">HOẶC</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            <GoogleLoginButton
              text="continue_with"
              onSuccess={() => {
                navigation.navigate("Home" as never);
              }}
            />
          </View>

          <View className="mt-4 items-center">
            <Text className="text-xs text-gray-500 text-center">
              Bằng cách tiếp tục, bạn đồng ý với <Text className="text-orange-600">Điều khoản dịch vụ</Text> và <Text className="text-orange-600">Chính sách bảo mật</Text> của chúng tôi
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default LoginPage;
