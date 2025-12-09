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
import { ArrowLeft, Mail, Lock, User, CheckCircle, AlertCircle } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import FormInput from "../components/FormInput";
import GoogleLoginButton from "../components/GoogleLoginButton";
import VerifyEmailModal from "../components/VerifyEmailModal";
import { LinearGradient } from "expo-linear-gradient";

// Redux
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { registerUser, clearError } from "../redux/slices/authSlice";
import type { RootState } from "../redux/store";

interface RegisterPageProps {
  onBack?: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onBack }) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { loading, error: authError } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    agreeToTerms: false,
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    password: "",
    confirmPassword: "",
  });

  // Auto-hide error after 3 seconds
  useEffect(() => {
    if (authError) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [authError, dispatch]);

  // Clear error when unmount (navigate away)
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation errors when user types
    if (name === "password" || name === "confirmPassword") {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCheckboxChange = () => {
    setFormData((prev) => ({
      ...prev,
      agreeToTerms: !prev.agreeToTerms,
    }));
  };

  const validateForm = (): boolean => {
    const errors = {
      password: "",
      confirmPassword: "",
    };

    // Validate password length
    if (formData.password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setValidationErrors(errors);
    return !errors.password && !errors.confirmPassword;
  };

  const handleSubmit = async () => {
    setShowSuccess(false);

    // Validate form
    if (!validateForm()) {
      return;
    }

    if (!formData.agreeToTerms) {
      return;
    }

    // Dispatch register action
    const result = await dispatch(
      registerUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      })
    );

    // Handle registration result
    if (registerUser.fulfilled.match(result)) {
      // Check if email verification is needed
      if (result.payload.needVerification) {
        // Show verify email modal
        setVerifyEmail(result.payload.user.email || formData.email);
        setShowVerifyModal(true);
      } else if (result.payload.token) {
        // Registration successful with token (Google OAuth)
        setShowSuccess(true);
        setTimeout(() => {
          navigation.navigate("Home" as never);
        }, 1500);
      }
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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="flex-row items-center mb-4"
            activeOpacity={0.7}
          >
            <ArrowLeft size={16} color="#4B5563" />
            <Text className="ml-2 text-sm text-gray-600">Quay về</Text>
          </TouchableOpacity>
          <View className="bg-white rounded-xl p-5 shadow-lg">
            <View className="items-center mb-5">
              <LinearGradient
                colors={["#F97316", "#DC2626"]}
                className="w-12 h-12 rounded-xl items-center justify-center mb-3"
              >
                <User size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text className="text-2xl font-bold text-gray-900 mb-1">Tạo tài khoản</Text>
              <Text className="text-sm text-gray-600">Tham gia cộng đồng của chúng tôi</Text>
            </View>

            {authError && (
              <View className="flex-row items-center bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <AlertCircle size={16} color="#991B1B" />
                <Text className="ml-2 text-sm text-red-800 flex-1">{authError}</Text>
              </View>
            )}

            {showSuccess && (
              <View className="flex-row items-center bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <CheckCircle size={16} color="#166534" />
                <Text className="ml-2 text-sm text-green-800">Đăng ký thành công!</Text>
              </View>
            )}

            <View className="mb-4">
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <FormInput
                    label="Họ"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Nguyễn"
                    icon={User}
                    required
                  />
                </View>
                <View className="flex-1">
                  <FormInput
                    label="Tên"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Văn A"
                    icon={User}
                    required
                  />
                </View>
              </View>

              <FormInput
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                icon={Mail}
                required
              />

              <View>
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
                {validationErrors.password && (
                  <Text className="mt-1 text-xs text-red-600">{validationErrors.password}</Text>
                )}
              </View>

              <View>
                <FormInput
                  label="Xác nhận mật khẩu"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  icon={Lock}
                  required
                />
                {validationErrors.confirmPassword && (
                  <Text className="mt-1 text-xs text-red-600">{validationErrors.confirmPassword}</Text>
                )}
              </View>

              <TouchableOpacity
                onPress={handleCheckboxChange}
                className="flex-row items-start mb-4"
                activeOpacity={0.7}
              >
                <View
                  className={`w-5 h-5 rounded border-2 mr-2 mt-0.5 items-center justify-center ${
                    formData.agreeToTerms
                      ? "bg-orange-500 border-orange-500"
                      : "bg-white border-gray-300"
                  }`}
                >
                  {formData.agreeToTerms && (
                    <CheckCircle size={14} color="#FFFFFF" />
                  )}
                </View>
                <Text className="text-sm text-gray-600 flex-1">
                  Tôi đồng ý với{" "}
                  <Text className="text-orange-600 font-medium">
                    Điều khoản
                  </Text>{" "}
                  và{" "}
                  <Text className="text-orange-600 font-medium">
                    Chính sách bảo mật
                  </Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading || !formData.agreeToTerms}
                activeOpacity={0.7}
                className="rounded-lg overflow-hidden"
              >
                <LinearGradient
                  colors={loading || !formData.agreeToTerms ? ["#9CA3AF", "#9CA3AF"] : ["#F97316", "#DC2626"]}
                  className="py-3 px-4 items-center justify-center"
                >
                  {loading ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text className="text-sm font-semibold text-white ml-2">
                        Đang tạo tài khoản
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-sm font-semibold text-white">Tạo tài khoản</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View className="items-center mb-4">
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-600">Đã có tài khoản? </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate("Login" as never)}
                >
                  <Text className="text-sm font-medium text-orange-600">Đăng nhập</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row items-center mb-4">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-3 text-xs text-gray-500">HOẶC</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            <GoogleLoginButton
              text="signup_with"
              onSuccess={() => {
                navigation.navigate("Home" as never);
              }}
            />
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Verify Email Modal */}
      <VerifyEmailModal 
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        email={verifyEmail}
      />
    </KeyboardAvoidingView>
  );
};

export default RegisterPage;
