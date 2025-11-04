import React, { useState } from "react";
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

interface LoginPageProps {
  onBack?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onBack }) => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [buttonLoading, setButtonLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setButtonLoading(true);
    setShowSuccess(false);
    setError(null);

    // Mock API call - replace with actual API
    setTimeout(() => {
      // Simulate success
      setShowSuccess(true);
      setTimeout(() => {
        navigation.navigate("Home" as never);
        setButtonLoading(false);
      }, 1000);
    }, 2000);
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
              <Text className="ml-2 text-sm text-gray-600">Back</Text>
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
              <Text className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</Text>
              <Text className="text-sm text-gray-600">Sign in to your account</Text>
            </View>

            {error && (
              <View className="flex-row items-center bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <AlertCircle size={16} color="#991B1B" />
                <Text className="ml-2 text-sm text-red-800">{error}</Text>
              </View>
            )}

            {showSuccess && (
              <View className="flex-row items-center bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <CheckCircle size={16} color="#166534" />
                <Text className="ml-2 text-sm text-green-800">Login successful!</Text>
              </View>
            )}

            <View className="mb-4">
              <FormInput
                label="Email"
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                icon={Mail}
                required
              />

              <FormInput
                label="Password"
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
                disabled={buttonLoading}
                activeOpacity={0.7}
                className="mt-2 rounded-lg overflow-hidden"
              >
                <LinearGradient
                  colors={buttonLoading ? ["#9CA3AF", "#9CA3AF"] : ["#F97316", "#DC2626"]}
                  className="py-3 px-4 items-center justify-center"
                >
                  {buttonLoading ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text className="text-sm font-semibold text-white ml-2">
                        Signing In
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-sm font-semibold text-white">Sign In</Text>
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
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <View className="flex-row items-center">
                <Text className="text-sm text-gray-600">Don't have an account? </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate("Register" as never)}
                >
                  <Text className="text-sm font-medium text-orange-600">Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row items-center mb-4">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-3 text-xs text-gray-500">OR</Text>
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
              By continuing, you agree to our <Text className="text-orange-600">Terms of Service</Text> and <Text className="text-orange-600">Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default LoginPage;
