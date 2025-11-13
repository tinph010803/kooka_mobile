import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft } from "lucide-react-native";

const PrivacyPolicyPage: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center border-gray-200 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <ChevronLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-gray-900 text-xl font-bold">Chính sách bảo mật</Text>
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View className="py-4">
          <Text className="text-gray-700 text-sm leading-6">
            Tại Kooka, chúng tôi cam kết bảo vệ quyền riêng tư và thông tin cá
            nhân của bạn khi bạn truy cập và sử dụng trang web của chúng tôi.
            Chính sách này cung cấp chi tiết về cách chúng tôi thu thập, sử dụng
            và bảo mật thông tin, đồng thời cam kết minh bạch trong việc quản lý
            dữ liệu cá nhân của người dùng.
          </Text>
        </View>

        {/* Section 1 */}
        <View className="mb-6">
          <Text className="text-gray-900 text-lg font-bold mb-3">
            Thông Tin Chúng Tôi Thu Thập
          </Text>
          <Text className="text-gray-700 text-sm leading-6 mb-3">
            Để cung cấp và cải thiện dịch vụ, Kooka thu thập thông tin từ người
            dùng thông qua nhiều hình thức, bao gồm:
          </Text>

          <View className="mb-3">
            <Text className="text-gray-900 font-semibold text-sm mb-2">
              Thông Tin Cá Nhân:
            </Text>
            <Text className="text-gray-700 text-sm leading-6">
              Khi bạn đăng ký tài khoản, nhận bản tin, hoặc liên hệ với chúng
              tôi, chúng tôi có thể thu thập các thông tin như tên, địa chỉ
              email, số điện thoại và các thông tin khác mà bạn cung cấp.
            </Text>
          </View>
        </View>

        {/* Section 2 */}
        <View className="mb-6">
          <Text className="text-gray-900 text-lg font-bold mb-3">
            Mục Đích Sử Dụng Thông Tin
          </Text>
          <Text className="text-gray-700 text-sm leading-6 mb-3">
            Thông tin được thu thập được sử dụng để:
          </Text>

          <View className="mb-2">
            <Text className="text-gray-900 font-semibold text-sm mb-2">
              • Cung Cấp Dịch Vụ:
            </Text>
            <Text className="text-gray-700 text-sm leading-6 ml-4">
              Sử dụng thông tin để cung cấp và duy trì các dịch vụ của Kooka,
              xử lý các yêu cầu và nâng cao trải nghiệm người dùng.
            </Text>
          </View>

          <View className="mb-2">
            <Text className="text-gray-900 font-semibold text-sm mb-2">
              • Giao Tiếp với Người Dùng:
            </Text>
            <Text className="text-gray-700 text-sm leading-6 ml-4">
              Gửi các thông báo, bản tin, cập nhật liên quan đến dịch vụ của
              chúng tôi. Người dùng có thể từ chối nhận các thông tin này bất
              kỳ lúc nào.
            </Text>
          </View>

          <View className="mb-2">
            <Text className="text-gray-900 font-semibold text-sm mb-2">
              • Phân Tích và Cải Thiện:
            </Text>
            <Text className="text-gray-700 text-sm leading-6 ml-4">
              Sử dụng thông tin phi cá nhân để hiểu rõ hơn về hành vi của người
              dùng và nâng cao chất lượng trang web, sản phẩm, và dịch vụ.
            </Text>
          </View>

          <View className="mb-2">
            <Text className="text-gray-900 font-semibold text-sm mb-2">
              • Bảo Mật:
            </Text>
            <Text className="text-gray-700 text-sm leading-6 ml-4">
              Áp dụng các biện pháp để bảo vệ trang web và người dùng khỏi các
              hành vi gian lận, đảm bảo an toàn thông tin và tuân thủ các yêu
              cầu pháp lý.
            </Text>
          </View>
        </View>

        {/* Section 3 */}
        <View className="mb-6">
          <Text className="text-gray-900 text-lg font-bold mb-3">
            Chia Sẻ Thông Tin
          </Text>
          <Text className="text-gray-700 text-sm leading-6 mb-3">
            Kooka cam kết không bán, trao đổi hoặc chia sẻ thông tin cá nhân của
            bạn với bất kỳ bên thứ ba nào, ngoại trừ trong các trường hợp sau:
          </Text>

          <View className="mb-2">
            <Text className="text-gray-900 font-semibold text-sm mb-2">
              • Với Sự Đồng Ý Của Bạn:
            </Text>
            <Text className="text-gray-700 text-sm leading-6 ml-4">
              Chúng tôi chỉ chia sẻ thông tin cá nhân khi có sự đồng ý rõ ràng
              của bạn.
            </Text>
          </View>

          <View className="mb-2">
            <Text className="text-gray-900 font-semibold text-sm mb-2">
              • Đối Tác và Nhà Cung Cấp Dịch Vụ:
            </Text>
            <Text className="text-gray-700 text-sm leading-6 ml-4">
              Chia sẻ thông tin với các đối tác và nhà cung cấp dịch vụ tin cậy
              để hỗ trợ trong việc cung cấp dịch vụ, xử lý thanh toán, và phân
              tích dữ liệu.
            </Text>
          </View>

          <View className="mb-2">
            <Text className="text-gray-900 font-semibold text-sm mb-2">
              • Tuân Thủ Pháp Luật:
            </Text>
            <Text className="text-gray-700 text-sm leading-6 ml-4">
              Kooka có thể tiết lộ thông tin cá nhân nếu được yêu cầu theo quy
              định pháp luật hoặc để bảo vệ quyền lợi, tài sản và an toàn của
              công ty và người dùng.
            </Text>
          </View>
        </View>

        {/* Section 4 */}
        <View className="mb-6">
          <Text className="text-gray-900 text-lg font-bold mb-3">
            Bảo Mật Thông Tin Cá Nhân
          </Text>
          <Text className="text-gray-700 text-sm leading-6">
            Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức để bảo vệ thông
            tin cá nhân của bạn khỏi việc mất mát, lạm dụng, truy cập trái phép,
            tiết lộ và thay đổi. Tuy nhiên, mặc dù chúng tôi luôn nỗ lực tối đa,
            không có phương pháp truyền tải hay lưu trữ nào là tuyệt đối an
            toàn. Kooka cam kết liên tục cải tiến các biện pháp bảo mật để bảo
            vệ thông tin của bạn.
          </Text>
        </View>

        {/* Section 5 */}
        <View className="mb-6">
          <Text className="text-gray-900 text-lg font-bold mb-3">
            Quyền Riêng Tư của Người Dùng
          </Text>
          <Text className="text-gray-700 text-sm leading-6 mb-3">
            Người dùng có quyền:
          </Text>

          <View className="mb-2">
            <Text className="text-gray-700 text-sm leading-6">
              • Truy cập, chính sửa và xóa thông tin cá nhân của mình mà chúng
              tôi lưu giữ. Để thực hiện các quyền này, vui lòng liên hệ với
              chúng tôi qua email:{" "}
              <Text className="text-green-600 font-semibold">cskh.kooka@gmail.com</Text>.
            </Text>
          </View>

          <View className="mb-2">
            <Text className="text-gray-700 text-sm leading-6">
              • Từ chối nhận thông báo từ Kooka bất kỳ lúc nào thông qua tùy
              chọn trong email hoặc liên hệ trực tiếp.
            </Text>
          </View>
        </View>

        {/* Section 6 */}
        <View className="mb-6">
          <Text className="text-gray-900 text-lg font-bold mb-3">
            Cookies và Công Nghệ Tương Tự
          </Text>
          <Text className="text-gray-700 text-sm leading-6 mb-3">
            Kooka sử dụng cookies và các công nghệ tương tự để thu thập thông
            tin phi cá nhân về cách bạn sử dụng trang web. Cookies giúp chúng
            tôi:
          </Text>

          <View className="mb-2">
            <Text className="text-gray-700 text-sm leading-6">
              • Cải thiện trải nghiệm người dùng bằng cách ghi nhớ sở thích của
              bạn.
            </Text>
          </View>

          <View className="mb-2">
            <Text className="text-gray-700 text-sm leading-6">
              • Phân tích lưu lượng truy cập và hành vi của người dùng để cải
              thiện dịch vụ.
            </Text>
          </View>

          <View className="mb-2">
            <Text className="text-gray-700 text-sm leading-6">
              • Cung cấp quảng cáo phù hợp dựa trên hoạt động của bạn.
            </Text>
          </View>

          <Text className="text-gray-700 text-sm leading-6 mt-3">
            Bạn có thể điều chỉnh cài đặt cookies thông qua trình duyệt của
            mình hoặc tắt cookies nếu muốn.
          </Text>
        </View>

        <View className="pb-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicyPage;
