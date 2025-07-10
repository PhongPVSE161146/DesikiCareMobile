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

// Logo (replace with your actual logo source)
const logo = require('../../../assets/DesikiCare.jpg'); // Update the path to your logo image

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
const notificationCount = notifications.length; // Based on notifications array

// Custom Notification Icon with Badge
const NotificationIcon = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.notificationContainer}>
      <Ionicons name="notifications-outline" size={24} color="#fff" />
      {notificationCount > 0 && (
        <View style={styles.badge}>
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
          />
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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
      <Text  style={styles.locationName}>{item.name}</Text>
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
          <Text style={styles.modalTitle} >Địa Chỉ Cửa Hàng</Text>
          <FlatList
          
            data={storeLocations}
            renderItem={renderLocation}
            
            keyExtractor={(item) => item.id}
            style={styles.locationList}
          />
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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

  return (
    <SafeAreaView style={[styles.header, { paddingTop: insets.top }]}>
      <View style={styles.headerContent}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchBar}
            placeholder="Tìm kiếm"
            placeholderTextColor="#ccc"
          />
        </View>
        <View style={styles.iconContainer}>
          <TouchableOpacity
            onPress={() => setLocationModalVisible(true)}
            style={styles.iconSpacing}
          >
            <Ionicons name="location-outline" size={24} color="#fff" />
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
    backgroundColor: '#fa7ca6',
    paddingHorizontal: 5,
    paddingBottom: 15,
    paddingTop: 10, // Dynamic padding based on safe area insets
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Ensure even spacing
    paddingHorizontal: 10,
    paddingTop: 10, // Lower all elements in the header
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 10,
  },
  searchIcon: {
    paddingHorizontal: 10,
  },
  searchBar: {
    flex: 1,
    paddingVertical: 8, // Reduced padding for better fit
    color: '#000',
    fontSize: 16,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSpacing: {
    marginHorizontal: 10, // Reduced spacing for better alignment
  },
  notificationContainer: {
    position: 'relative', // For positioning the badge
    marginHorizontal: 10, // Match iconSpacing
  },
  badge: {
    position: 'absolute',
    top: -5, // Adjust to position badge at top-right of icon
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff', // White border for contrast
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    backgroundColor: '#fff',
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
    borderBottomColor: '#eee',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#333',
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  locationList: {
    flexGrow: 0,
  },
  locationItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationAddress: {
    fontSize: 14,
    color: '#333',
  },
  locationPhone: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fa7ca6',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomHeader;