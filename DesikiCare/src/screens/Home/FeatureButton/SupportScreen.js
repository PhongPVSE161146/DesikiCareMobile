import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const SupportScreen = () => {
  const navigation = useNavigation();

  const handleCall = () => {
    Linking.openURL('tel:028 3835 1118');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@desikicare.vn');
  };

  const handleWebsite = () => {
    Linking.openURL('https://www.desikicare.vn');
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hỗ Trợ</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Trung Tâm Hỗ Trợ DesikiCare</Text>
          <Text style={styles.description}>
            Chúng tôi luôn sẵn sàng hỗ trợ bạn trong quá trình mua sắm và sử dụng sản phẩm:
          </Text>

          <Text style={styles.sectionTitle}>📞 Tổng đài hỗ trợ</Text>
          <TouchableOpacity onPress={handleCall}>
            <Text style={styles.link}>028 3835 1118 (8:00 - 17:00, Thứ 2 - Thứ 6)</Text>
            <Text style={styles.bullet}>
              • Gọi để được tư vấn, giải đáp thắc mắc về sản phẩm và đơn hàng.
            </Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>📧 Email hỗ trợ</Text>
          <TouchableOpacity onPress={handleEmail}>
            <Text style={styles.link}>support@desikicare.vn</Text>
            <Text style={styles.bullet}>
              • Gửi câu hỏi, khiếu nại hoặc yêu cầu hỗ trợ qua email.
            </Text>
          
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>🌐 Website</Text>
          <TouchableOpacity onPress={handleWebsite}>
            <Text style={styles.link}>www.desikicare.vn</Text>
            <Text style={styles.bullet}>
              • Truy cập để xem thông tin sản phẩm, chính sách và hướng dẫn sử dụng.
            </Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>📦 Các vấn đề thường gặp</Text>
          <Text style={styles.bullet}>• Kiểm tra đơn hàng và tình trạng vận chuyển</Text>
          <Text style={styles.bullet}>• Hướng dẫn đổi trả và hoàn tiền</Text>
          <Text style={styles.bullet}>• Cách sử dụng sản phẩm mỹ phẩm an toàn</Text>
          <Text style={styles.bullet}>• Chính sách tích điểm và ưu đãi</Text>
          <Text style={styles.bullet}>• Góp ý hoặc khiếu nại dịch vụ</Text>

          <Text style={styles.footerNote}>
            DesikiCare cam kết phản hồi hỗ trợ trong vòng 24h (trong ngày làm việc).
          </Text>
        </View>
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
    marginTop: 20,
    marginBottom: 8,
  },
  link: {
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  bullet: {
    fontSize: 16,
    color: '#555',
    marginVertical: 4,
    paddingLeft: 8,
  },
  footerNote: {
    marginTop: 30,
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default SupportScreen;
