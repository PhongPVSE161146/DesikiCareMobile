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
  Linking,
  Dimensions,
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

// Hard-coded store location data in Vietnamese with coordinates for Google Maps
const storeLocations = [
  {
    id: '1',
    name: 'Cửa Hàng DesikiCare TP.HCM',
    address: '6B Trần Cao Vân, Đa Kao, Quận 1, Hồ Chí Minh 700000, Vietnam',
    phone: '0901234567',
    lat: 10.785160368265332,
    lng: 106.69805416143762,
  },
  {
    id: '2',
    name: 'Cửa Hàng DesikiCare TP.HCM',
    address: 'VINCOM GRAND PARK 88, Nguyễn Xiển, Long Thạnh Mỹ, Thủ Đức, Hồ Chí Minh 70000, Vietnam',
    phone: '0917654321',
    lat: 10.843333101144372,
    lng: 106.84249976723999,
  },
  {
    id: '3',
    name: 'Cửa Hàng DesikiCare TP.HCM',
    address: '369 Nguyễn Văn Tăng, Long Thạnh Mỹ, Thủ Đức, Hồ Chí Minh 71300, Vietnam',
    phone: '0936258147',
    lat: 10.841207879370142,
    lng: 106.82554051482401,
  },
];

// Hard-coded notification count
const notificationCount = notifications.length;

// Custom Notification Icon with Badge
const NotificationIcon = ({ onPress, setNotification }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.notificationContainer}
      accessibilityLabel={`Thông báo, ${notificationCount} thông báo mới chưa đọc`}
      accessibilityRole="button"
    >
      <Ionicons name="notifications-outline" size={26} color={COLORS.white} />
      {notificationCount > 0 && (
        <View style={[styles.badge, { minWidth: notificationCount > 99 ? 28 : notificationCount > 9 ? 24 : 20 }]}>
          <Text style={styles.badgeText}>{notificationCount > 99 ? '99+' : notificationCount}</Text>
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
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Thông Báo</Text>
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id}
            style={styles.notificationList}
            contentContainerStyle={styles.listContent}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
          />
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityLabel="Đóng danh sách thông báo"
            accessibilityRole="button"
          >
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Location Modal Component with Google Maps Integration
const LocationModal = ({ visible, onClose, setNotification }) => {
  const openGoogleMaps = (lat, lng, name) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(name)}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          setNotification({
            message: 'Không thể mở Google Maps. Vui lòng thử lại sau.',
            type: 'error',
          });
        }
      })
      .catch((err) => {
턴:         console.error('Lỗi khi mở Google Maps:', err);
        setNotification({
          message: 'Không thể mở Google Maps. Vui lòng thử lại sau.',
          type: 'error',
        });
      });
  };

  const renderLocation = ({ item }) => (
    <TouchableOpacity
      onPress={() => openGoogleMaps(item.lat, item.lng, item.name)}
      style={styles.locationItem}
      accessibilityLabel={`Mở ${item.name} trên Google Maps`}
      accessibilityRole="button"
    >
      <Text style={styles.locationName}>{item.name}</Text>
      <Text style={styles.locationAddress}>{item.address}</Text>
      <Text style={styles.locationPhone}>SĐT: {item.phone}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Địa Chỉ Cửa Hàng</Text>
          <FlatList
            data={storeLocations}
            renderItem={renderLocation}
            keyExtractor={(item) => item.id}
            style={styles.locationList}
            contentContainerStyle={styles.listContent}
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

const CustomHeader = ({ setNotification }) => {
  const insets = useSafeAreaInsets();
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Responsive logo size based on screen width
  const screenWidth = Dimensions.get('window').width;
  const logoSize = Math.min(screenWidth * 0.12, 48); // 12% of screen width, max 48px

  return (
    <SafeAreaView style={[styles.header, { paddingTop: insets.top }]}>
      
      <View style={styles.headerContent}>
        <Image
          source={logo}
          style={[styles.logo, { width: logoSize, height: logoSize }]}
          resizeMode="contain"
          onError={() => console.log('Failed to load logo')}
          defaultSource={fallbackLogo}
          accessibilityLabel="Logo DesikiCare"
        />
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={22} color={COLORS.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchBar}
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor={COLORS.lightGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => console.log('Search query:', searchQuery)}
            accessibilityLabel="Tìm kiếm sản phẩm mỹ phẩm"
            accessibilityRole="search"
          />
        </View>
        <View style={styles.iconContainer}>
          <TouchableOpacity
            onPress={() => setLocationModalVisible(true)}
            style={styles.iconButton}
            accessibilityLabel="Xem danh sách cửa hàng DesikiCare"
            accessibilityRole="button"
          >
            <Ionicons name="location-outline" size={26} color={COLORS.white} />
          </TouchableOpacity>
          <NotificationIcon
            onPress={() => setNotificationModalVisible(true)}
            setNotification={setNotification}
          />
        </View>
      </View>
      <NotificationModal visible={notificationModalVisible} onClose={() => setNotificationModalVisible(false)} />
      <LocationModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        setNotification={setNotification}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingBottom: 12,
    
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  logo: {
    marginRight: 8,
    borderRadius: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginHorizontal: 8,
    paddingHorizontal: 8,
    maxWidth: Dimensions.get('window').width * 0.6, // Cap search bar width
  },
  searchIcon: {
    paddingHorizontal: 8,
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
  iconButton: {
    padding: 12, // Larger touch target
    marginHorizontal: 4,
  },
  notificationContainer: {
    padding: 12, // Larger touch target
    position: 'relative',
    marginHorizontal: 4,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.red,
    borderRadius: 12,
    height: 20,
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
    paddingHorizontal: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    width: '92%',
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    color: COLORS.darkGray,
  },
  notificationList: {
    flexGrow: 0,
  },
  listContent: {
    paddingBottom: 8,
  },
  notificationItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: COLORS.lightGray,
    marginTop: 4,
  },
  locationList: {
    flexGrow: 0,
  },
  locationItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  locationAddress: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  locationPhone: {
    fontSize: 12,
    color: COLORS.lightGray,
    marginTop: 4,
  },
  closeButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomHeader;