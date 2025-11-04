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
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import FormInput from "../components/FormInput";
import { LinearGradient } from "expo-linear-gradient";

interface ForgotPasswordPageProps {
    onBack?: () => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBack }) => {
    const navigation = useNavigation();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleInputChange = (name: string, value: string) => {
        setEmail(value);
    };

    const handleSubmit = async () => {
        setSuccessMessage(null);
        setError(null);
        setLoading(true);

        setTimeout(() => {
            setSuccessMessage("Liên kết đặt lại mật khẩu đã được gửi đến email của bạn");
            setEmail("");
            setLoading(false);
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
                    contentContainerClassName="flex-grow p-6 justify-center"
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <TouchableOpacity
                        onPress={() => onBack ? onBack() : navigation.goBack()}
                        className="flex-row items-center mb-6"
                        activeOpacity={0.7}
                    >
                        <View className="bg-gray-100 rounded-full p-2 mr-2">
                            <ArrowLeft size={20} color="#374151" />
                        </View>
                        <Text className="text-base text-gray-700 font-semibold">Quay lại</Text>
                    </TouchableOpacity>
                    <View className="bg-white rounded-2xl p-6 shadow-xl">
                        <View className="items-center mb-8">
                            <LinearGradient
                                colors={["#F97316", "#DC2626"]}
                                className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
                            >
                                <Mail size={32} color="#FFFFFF" />
                            </LinearGradient>
                            <Text className="text-3xl font-bold text-gray-900 mb-2">Quên Mật Khẩu</Text>
                            <Text className="text-sm text-gray-600 text-center px-4">Nhập email của bạn để nhận liên kết đặt lại mật khẩu</Text>
                        </View>

                        {error && (
                            <View className="flex-row items-center bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
                                <AlertCircle size={20} color="#991B1B" />
                                <Text className="ml-3 text-sm text-red-800 flex-1">{error}</Text>
                            </View>
                        )}

                        {successMessage && (
                            <View className="flex-row items-center bg-green-50 border border-green-200 rounded-xl p-4 mb-5">
                                <CheckCircle size={20} color="#166534" />
                                <Text className="ml-3 text-sm text-green-800 flex-1">{successMessage}</Text>
                            </View>
                        )}

                        <View className="mb-6">
                            <FormInput
                                label="Email"
                                type="email"
                                name="email"
                                value={email}
                                onChange={handleInputChange}
                                placeholder="john@example.com"
                                icon={Mail}
                                required
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading || !email.trim()}
                            activeOpacity={0.7}
                            className="rounded-xl overflow-hidden shadow-md"
                        >
                            <LinearGradient
                                colors={loading || !email.trim() ? ["#9CA3AF", "#9CA3AF"] : ["#F97316", "#DC2626"]}
                                className="py-4 px-6 items-center justify-center"
                            >
                                {loading ? (
                                    <View className="flex-row items-center">
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                        <Text className="text-base font-bold text-white ml-3">
                                            Đang gửi...
                                        </Text>
                                    </View>
                                ) : (
                                    <Text className="text-base font-bold text-white">Gửi Liên Kết Đặt Lại</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <View className="items-center my-6">
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => navigation.navigate("Login" as never)}
                            >
                                <Text className="text-base text-gray-700">
                                    Đã nhớ mật khẩu?{" "}
                                    <Text className="text-orange-600 font-semibold">Đăng nhập</Text>
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                            <View className="items-center">
                                <Text className="text-sm font-semibold text-orange-800 mb-2">
                                    Cần Hỗ Trợ?
                                </Text>
                                <Text className="text-xs text-orange-700 text-center leading-5">
                                    Kiểm tra thư mục spam nếu bạn không thấy email
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View className="mt-6 items-center px-4">
                        <Text className="text-xs text-gray-500 text-center leading-5">
                            Bằng việc tiếp tục, bạn đồng ý với{" "}
                            <Text className="text-orange-600 font-medium">Điều khoản dịch vụ</Text>
                            {" "}và{" "}
                            <Text className="text-orange-600 font-medium">Chính sách bảo mật</Text> của chúng tôi
                        </Text>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
};

export default ForgotPasswordPage;
