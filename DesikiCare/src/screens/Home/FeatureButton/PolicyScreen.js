import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const LinkText = ({ url, children }) => (
  <Text style={styles.link} onPress={() => Linking.openURL(url)}>
    {children}
  </Text>
);

const PolicyScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chính Sách DesikiCare</Text>
        </View>
        <ScrollView style={styles.content}>
          <Text style={styles.title}>Chính Sách của DesikiCare</Text>
          <Text style={styles.description}>
            Dưới đây là các chính sách áp dụng khi bạn mua sắm và sử dụng sản phẩm mỹ phẩm tại DesikiCare. Chúng tôi cam kết mang đến trải nghiệm mua sắm an toàn, minh bạch và chất lượng.
          </Text>

          <Text style={styles.sectionTitle}>1. Cam Kết Chất Lượng Sản Phẩm</Text>
          <Text style={styles.sectionText}>
            - Tất cả sản phẩm mỹ phẩm tại DesikiCare đều được nhập khẩu chính hãng hoặc sản xuất theo tiêu chuẩn chất lượng của Bộ Y tế Việt Nam và Hiệp định Mỹ phẩm ASEAN.
          </Text>
          <LinkText url="http://soytequangninh.gov.vn/trang-chu/huong-dan-nghiep-vu/linh-vuc-duoc/cap-nhat-quy-dinh-ve-cac-chat-su-dung-trong-my-pham.html">
            [Xem chi tiết từ Bộ Y tế]
          </LinkText>
          <Text style={styles.sectionText}>
            - Mỗi sản phẩm đều có đầy đủ thông tin về ngày sản xuất (NSX), hạn sử dụng (HSD), và thành phần công thức theo danh pháp quốc tế (INCI).
          </Text>
          <LinkText url="https://thuvienphapluat.vn/phap-luat/han-su-dung-cua-my-pham-la-gi-cach-ghi-ngay-san-xuat-han-su-dung-cua-my-pham-tren-nhan-san-pham-788239-173047.html">
            [Xem hướng dẫn ghi HSD và NSX]
          </LinkText>
          <Text style={styles.sectionText}>
            - Sản phẩm không chứa các chất cấm như thủy ngân, chloroform hoặc các chất tạo màu không an toàn theo quy định của FDA và Bộ Y tế.
          </Text>
          <LinkText url="https://chungnhanfda.vn/cach-dang-ky-fda-cho-my-pham-nhap-khau-vao-hoa-ky-nhanh-chong-va-hieu-qua/">
            [Xem quy định FDA cho mỹ phẩm]
          </LinkText>

          <Text style={styles.sectionTitle}>2. Chính Sách Đổi Trả</Text>
          <Text style={styles.sectionText}>
            - Đổi trả trong 7 ngày nếu:
            {'\n'}  + Có lỗi từ nhà sản xuất.
            {'\n'}  + Hết hạn sử dụng.
            {'\n'}  + Giao sai sản phẩm.
            {'\n'}- Sản phẩm đổi trả phải nguyên vẹn và có hoá đơn.
            {'\n'}- Liên hệ qua hotline hoặc email để được hỗ trợ.
          </Text>

          <Text style={styles.sectionTitle}>3. Chính Sách Giao Hàng</Text>
          <Text style={styles.sectionText}>
            - Thời gian giao hàng:
            {'\n'}  + TP.HCM & Hà Nội: 1-3 ngày.
            {'\n'}  + Tỉnh thành khác: 3-7 ngày.
            {'\n'}- Miễn phí ship cho đơn hàng trên 500.000đ.
          </Text>
          <LinkText url="https://www.watsons.vn/vi/blog/cham-soc-da/xu-huong-skincare-2025-cac-trao-luu-noi-bat-dau-nam">
            [Xem xu hướng đóng gói bền vững]
          </LinkText>

          <Text style={styles.sectionTitle}>4. Chính Sách Bảo Mật</Text>
          <Text style={styles.sectionText}>
            - Bảo mật thông tin theo Luật Bảo vệ quyền lợi người tiêu dùng.
            {'\n'}- Dữ liệu chỉ dùng để xử lý đơn hàng, gửi khuyến mãi nếu được đồng ý.
            {'\n'}- Không chia sẻ cho bên thứ 3 nếu không có sự đồng ý.
          </Text>

          <Text style={styles.sectionTitle}>5. Hướng Dẫn Sử Dụng Sản Phẩm</Text>
          <Text style={styles.sectionText}>
            - Kiểm tra HSD trước khi dùng. Mỹ phẩm mở nắp nên dùng trong 6-24 tháng.
          </Text>
          <LinkText url="https://bazaarvietnam.vn/meo-hay-giup-xem-han-su-dung-my-pham-chinh-xac-va-day-du-nhat/">
            [Xem cách kiểm tra hạn mỹ phẩm]
          </LinkText>
          <Text style={styles.sectionText}>
            - Thử trên vùng da nhỏ trước khi dùng.
          </Text>
          <LinkText url="https://drhalee.vn/7-quy-tac-skincare-co-ban.html">
            [Xem hướng dẫn skincare cơ bản]
          </LinkText>
          <Text style={styles.sectionText}>
            - Bảo quản nơi khô mát, tránh nắng. Có thể để tủ lạnh nếu cần.
          </Text>

          <Text style={styles.sectionTitle}>6. Chính Sách Khách Hàng Thân Thiết</Text>
          <Text style={styles.sectionText}>
            - Tích điểm đổi quà, ưu đãi riêng.
            {'\n'}- Ưu tiên trải nghiệm sản phẩm mới.
          </Text>

          <Text style={styles.sectionTitle}>7. Liên Hệ và Hỗ Trợ</Text>
          <Text style={styles.sectionText}>
            - Hotline: 028 3835 1118 (8:00 - 17:00, Thứ 2 - Thứ 6)
            {'\n'}- Email: support@desikicare.vn
            {'\n'}- Địa chỉ: Lưu Hữu Phước Tân Lập, Đông Hoà, Dĩ An, Bình Dương
          </Text>

          <Text style={styles.sectionText}>
            Chính sách này có hiệu lực từ ngày 30/06/2025 và có thể thay đổi định kỳ. Theo dõi website/app để biết thêm chi tiết.
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 15,
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
    backgroundColor: '#E0F7FA',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 10,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
    marginBottom: 10,
  },
});

export default PolicyScreen;
