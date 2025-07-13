import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  SafeAreaView,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Theme colors
const COLORS = {
  primary: '#fa7ca6',
  white: '#fff',
  gray: '#666',
  lightGray: '#ccc',
  darkGray: '#333',
  borderGray: '#eee',
  red: 'red',
};

// Logo (replace with your actual logo source or fallback)
const logo = require('../../../assets/DesikiCare.jpg'); // Update the path to your logo image
const fallbackLogo = require('../../../assets/DesikiCare.jpg'); // Fallback image

// Hard-coded notification data in Vietnamese (cosmetics context)
const notifications = [
  { id: '1', title: 'Ưu Đãi Mới!', message: 'Giảm 20% cho lần mua sắm tiếp theo của bạn.', time: '10:00 Sáng' },
  { id: '2', title: 'Đơn Hàng Đã Gửi', message: 'Đơn hàng #1234 của bạn đã được gửi.', time: 'Hôm Qua' },
  { id: '3', title: 'Nhắc Nhở', message: 'Hoàn thiện hồ sơ để nhận thưởng.', time: '2 Ngày Trước' },
];

// Hard-coded store location data in Vietnamese (cosmetics stores in Vietnam)
const storeLocations = [
  { id: '1', name: 'Cửa Hàng DesikiCare Hà Nội', address: '123 Đường Láng, Hà Nội', phone: '0901234567' },
  { id: '2', name: 'Cửa Hàng DesikiCare TP.HCM', address: '456 Lê Lợi, TP. Hồ Chí Minh', phone: '0917654321' },
  { id: '3', name: 'Cửa Hàng DesikiCare Đà Nẵng', address: '789 Nguyễn Văn Linh, Đà Nẵng', phone: '0936258147' },
];

// Hard-coded notification count
const notificationCount = notifications.length;

// Custom Notification Icon with Badge
const NotificationIcon = ({ onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.notificationContainer}
      accessibilityLabel={`Thông báo, ${notificationCount} thông báo mới`}
      accessibilityRole="button"
    >
      <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
      {notificationCount > 0 && (
        <View style={[styles.badge, { minWidth: notificationCount > 9 ? 24 : 18 }]}>
          <Text style={styles.badgeText}>{notificationCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Notification Modal Component
const NotificationModal = ({ visible, onClose }) => {
  const renderNotification = ({ item }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationTitle}>{item.title}</Text>
      <Text style={styles.notificationMessage}>{item.message}</Text>
      <Text style={styles.notificationTime}>{item.time}</Text>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Thông Báo</Text>
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id}
            style={styles.notificationList}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
          />
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityLabel="Đóng thông báo"
            accessibilityRole="button"
          >
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Location Modal Component
const LocationModal = ({ visible, onClose }) => {
  const renderLocation = ({ item }) => (
    <View style={styles.locationItem}>
      <Text style={styles.locationName}>{item.name}</Text>
      <Text style={styles.locationAddress}>{item.address}</Text>
      <Text style={styles.locationPhone}>{item.phone}</Text>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Địa Chỉ Cửa Hàng</Text>
          <FlatList
            data={storeLocations}
            renderItem={renderLocation}
            keyExtractor={(item) => item.id}
            style={styles.locationList}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
          />
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityLabel="Đóng danh sách cửa hàng"
            accessibilityRole="button"
          >
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const CustomHeader = () => {
  const insets = useSafeAreaInsets();
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView style={[styles.header, { paddingTop: insets.bottom }]}>
      <View style={styles.headerContent}>
        <Image
          source={logo}
          style={styles.logo}
          resizeMode="contain"
          onError={() => console.log('Failed to load logo')}
          defaultSource={fallbackLogo}
        />
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchBar}
            placeholder="Tìm kiếm"
            placeholderTextColor={COLORS.lightGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => console.log('Search query:', searchQuery)}
            accessibilityLabel="Tìm kiếm sản phẩm"
            accessibilityRole="textbox"
          />
        </View>
        <View style={styles.iconContainer}>
          <TouchableOpacity
            onPress={() => setLocationModalVisible(true)}
            style={styles.iconSpacing}
            accessibilityLabel="Xem danh sách cửa hàng"
            accessibilityRole="button"
          >
            <Ionicons name="location-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <NotificationIcon onPress={() => setNotificationModalVisible(true)} />
        </View>
      </View>
      <NotificationModal
        visible={notificationModalVisible}
        onClose={() => setNotificationModalVisible(false)}
      />
      <LocationModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 5,
    paddingBottom: 15,
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
    paddingBottom: 5,
    borderRadius: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginHorizontal: 10,
    
  },
  searchIcon: {
    paddingHorizontal: 10,
  },
  searchBar: {
    flex: 1,
    paddingVertical: 8,
    color: COLORS.darkGray,
    fontSize: 16,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSpacing: {
    marginHorizontal: 10,
  },
  notificationContainer: {
    position: 'relative',
    marginHorizontal: 10,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.red,
    borderRadius: 10,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  notificationList: {
    flexGrow: 0,
  },
  notificationItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  notificationTime: {
    fontSize: 12,
    color: COLORS.lightGray,
    marginTop: 5,
  },
  locationList: {
    flexGrow: 0,
  },
  locationItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationAddress: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  locationPhone: {
    fontSize: 12,
    color: COLORS.lightGray,
    marginTop: 5,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomHeader;