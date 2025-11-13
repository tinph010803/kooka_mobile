import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, Send } from "lucide-react-native";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

const ContactPage: React.FC = () => {
  const navigation = useNavigation();

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err)
    );
  };

  // Instagram Icon Component
  const InstagramIcon = ({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
      <Path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/>
    </Svg>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center border-gray-200 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <ChevronLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-gray-900 text-xl font-bold">Liên hệ</Text>
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View className="py-4">
          <Text className="text-gray-700 text-sm leading-6">
            Chào mừng bạn đến với trang <Text className="font-bold">Liên Hệ</Text> của Kooka! Chúng tôi luôn sẵn sàng lắng
            nghe và hỗ trợ bạn để mang lại trải nghiệm tốt nhất khi sử dụng dịch
            vụ. Nếu có bất kỳ câu hỏi, góp ý, hoặc yêu cầu hỗ trợ nào, hãy liên
            hệ với chúng tôi qua các thông tin dưới đây.
          </Text>
        </View>

        {/* Section 1 */}
        <View className="mb-6">
          <Text className="text-gray-900 text-lg font-bold mb-3">
            1. Thông Tin Liên Hệ Chính
          </Text>
          <Text className="text-gray-700 text-sm leading-6 mb-3">
            Email hỗ trợ khách hàng:{" "}
            <Text className="text-green-600 font-semibold">cskh.kooka@gmail.com</Text>
          </Text>

          <View className="mb-3">
            <Text className="text-gray-900 font-semibold text-sm mb-2">
              • Vấn đề tài khoản:
            </Text>
            <Text className="text-gray-700 text-sm leading-6 ml-4">
              Quên mật khẩu, không thể truy cập, và các vấn đề liên quan đến tài
              khoản.
            </Text>
          </View>

          <View className="mb-3">
            <Text className="text-gray-900 font-semibold text-sm mb-2">
              • Hỗ trợ kỹ thuật:
            </Text>
            <Text className="text-gray-700 text-sm leading-6 ml-4">
              Sự cố khi xem công thức, chất lượng video hoặc các lỗi khác khi sử
              dụng trang web.
            </Text>
          </View>

          <View className="mb-3">
            <Text className="text-gray-900 font-semibold text-sm mb-2">
              • Đóng góp ý kiến:
            </Text>
            <Text className="text-gray-700 text-sm leading-6 ml-4">
              Chúng tôi trân trọng mọi ý kiến đóng góp từ bạn để nâng cao chất
              lượng dịch vụ.
            </Text>
          </View>

          <View className="mb-3">
            <Text className="text-gray-700 text-sm leading-6">
              Email liên hệ về Chính Sách Riêng Tư:
            </Text>
            <Text className="text-green-600 text-sm font-semibold">
              privacy@kooka.net
            </Text>
          </View>

          <Text className="text-gray-700 text-sm leading-6">
            Mọi thắc mắc liên quan đến bảo mật thông tin và chính sách riêng tư
            của Kooka.
          </Text>
        </View>

        {/* Section 2 - Social Media */}
        <View className="mb-6">
          <Text className="text-gray-900 text-lg font-bold mb-3">
            2. Liên Hệ Qua Mạng Xã Hội
          </Text>
          <Text className="text-gray-700 text-sm leading-6 mb-4">
            Ngoài email, bạn cũng có thể liên hệ và cập nhật thông tin mới nhất
            từ Kooka qua các kênh mạng xã hội của chúng tôi:
          </Text>

          {/* Social Links */}
          <TouchableOpacity
            onPress={() => handleOpenLink("https://t.me/")}
            className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm border border-gray-100"
          >
            <View className="w-10 h-10 bg-[#0088cc] rounded-full items-center justify-center mr-3">
              <Send size={20} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold mb-1">Telegram</Text>
              <Text className="text-gray-500 text-xs">
                https://t.me/kooka
              </Text>
            </View>
            <ChevronLeft
              size={20}
              color="#9CA3AF"
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              handleOpenLink("https://www.facebook.com")
            }
            className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm border border-gray-100"
          >
            <View className="w-10 h-10 bg-[#1877f2] rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold text-lg">f</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold mb-1">Facebook</Text>
              <Text className="text-gray-500 text-xs">
                https://www.facebook.com/kooka
              </Text>
            </View>
            <ChevronLeft
              size={20}
              color="#9CA3AF"
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              handleOpenLink("https://www.instagram.com/")
            }
            className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm border border-gray-100"
          >
            <LinearGradient
              colors={['#9333ea', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <InstagramIcon size={20} color="#ffffff" />
            </LinearGradient>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold mb-1">Instagram</Text>
              <Text className="text-gray-500 text-xs">
                https://www.instagram.com/kooka/
              </Text>
            </View>
            <ChevronLeft
              size={20}
              color="#9CA3AF"
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleOpenLink("https://x.com/kookateam")}
            className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm border border-gray-100"
          >
            <View className="w-10 h-10 bg-black rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold text-lg">𝕏</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold mb-1">Twitter (𝕏)</Text>
              <Text className="text-gray-500 text-xs">
                https://x.com/kooka
              </Text>
            </View>
            <ChevronLeft
              size={20}
              color="#9CA3AF"
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </TouchableOpacity>
        </View>

        {/* Section 3 - FAQ */}
        <View className="mb-6">
          <Text className="text-gray-900 text-lg font-bold mb-3">
            3. Câu Hỏi Thường Gặp (F.A.Q)
          </Text>
          <Text className="text-gray-700 text-sm leading-6 mb-3">
            Trước khi gửi yêu cầu hỗ trợ, bạn có thể tham khảo trang{" "}
            <Text className="text-green-600 font-semibold">
              Câu Hỏi Thường Gặp (F.A.Q)
            </Text>{" "}
            để tìm câu trả lời nhanh cho các vấn đề phổ biến nhất tại{" "}
            <Text className="text-green-600 font-semibold">F.A.Q - Kooka</Text>.
          </Text>

          <Text className="text-gray-700 text-sm leading-6">
            Chúng tôi rất vui khi được hỗ trợ bạn và mong muốn mang đến trải
            nghiệm xem công thức trực tuyến tốt nhất!
          </Text>

          <Text className="text-green-600 text-base font-bold mt-4">
            Kooka - Cùng bạn khám phá thế giới ăn uống đa dạng, an toàn và miễn
            phí!
          </Text>
        </View>

        <View className="pb-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ContactPage;
