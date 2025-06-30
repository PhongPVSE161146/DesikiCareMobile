import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native'; // Thêm TouchableOpacity
import styles from './styles';

const AddressListSection = ({
  deliveryAddresses,
  setNotification,
  handleSetDefaultAddress,
  handleDeleteAddress,
  loading,
}) => {
  const renderAddressItem = ({ item }) => (
    <View style={styles.addressItem}>
      <View style={styles.addressContent}>
        <Text style={styles.addressText}>
          {item.receiverName} | {item.receiverPhone}
        </Text>
        <Text style={styles.addressText}>{item.addressDetailDescription}</Text>
        <Text style={styles.addressText}>
          {item.wardCode}, {item.districtCode}, {item.provinceCode}
        </Text>
        {item.isDefault && <Text style={styles.defaultBadge}>Mặc định</Text>}
      </View>
      <View style={styles.addressActions}>
        {!item.isDefault && (
          <TouchableOpacity
            onPress={() => handleSetDefaultAddress(item._id)}
            style={styles.actionButton}
            accessible={true}
            accessibilityLabel="Đặt làm địa chỉ mặc định"
          >
            <Text style={styles.actionText}>Đặt mặc định</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => handleDeleteAddress(item._id)}
          style={[styles.actionButton, { backgroundColor: '#FF5722' }]}
          accessible={true}
          accessibilityLabel="Xóa địa chỉ này"
        >
          <Text style={styles.actionText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Danh sách địa chỉ</Text>
      {deliveryAddresses.length > 0 ? (
        <FlatList
          data={deliveryAddresses}
          renderItem={renderAddressItem}
          keyExtractor={(item) => item._id}
          style={styles.addressList}
          nestedScrollEnabled={true}
        />
      ) : (
        <Text style={styles.noAddressText}>Chưa có địa chỉ nào.</Text>
      )}
    </View>
  );
};

export default AddressListSection;