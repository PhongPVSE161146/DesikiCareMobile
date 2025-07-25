import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import profileService from '../../config/axios/Home/AccountProfile/profileService';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Cache for provinces, districts, and wards
const cache = {
  provinces: null,
  districts: {},
  wards: {},
};

const AddressHandler = ({ navigation, formikRef, setNotification, setAddresses }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setLocalAddresses] = useState([]);

  // Map province, district, ward codes to names
  const mapCodeToName = async (provinceCode, districtCode, wardCode) => {
    try {
      const pCode = Number(provinceCode);
      const dCode = Number(districtCode);
      const wCode = Number(wardCode);

      if (!cache.provinces) {
        const response = await axios.get('https://provinces.open-api.vn/api/p/');
        cache.provinces = response.data || [];
      }
      const province = cache.provinces.find((p) => p.code === pCode)?.name || 'Tỉnh không xác định';

      if (!cache.districts[pCode]) {
        const response = await axios.get(`https://provinces.open-api.vn/api/p/${pCode}?depth=2`);
        cache.districts[pCode] = response.data.districts || [];
      }
      const district = cache.districts[pCode].find((d) => d.code === dCode)?.name || 'Quận/Huyện không xác định';

      if (!cache.wards[dCode]) {
        const response = await axios.get(`https://provinces.open-api.vn/api/d/${dCode}?depth=2`);
        cache.wards[dCode] = response.data.wards || [];
      }
      const ward = cache.wards[dCode].find((w) => w.code === wCode)?.name || 'Phường/Xã không xác định';

      return { province, district, ward };
    } catch (error) {
      console.error('Lỗi ánh xạ mã địa chỉ:', error);
      return {
        province: 'Tỉnh không xác định',
        district: 'Quận/Huyện không xác định',
        ward: 'Phường/Xã không xác định',
      };
    }
  };

  // Fetch provinces
  const fetchProvinces = async () => {
    try {
      if (!cache.provinces) {
        const response = await axios.get('https://provinces.open-api.vn/api/p/');
        cache.provinces = response.data || [];
      }
    } catch (error) {
      console.error('Lỗi tải danh sách tỉnh/thành phố:', error);
      setNotification({ message: 'Không thể tải danh sách tỉnh/thành phố.', type: 'error' });
    }
  };

  // Fetch delivery addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      setIsLoading(true);
      try {
        await fetchProvinces();
        const response = await profileService.getDeliveryAddresses();
        if (response.success && response.data?.length > 0) {
          const mappedAddresses = await Promise.all(
            response.data.map(async (address) => {
              const { province, district, ward } = await mapCodeToName(
                address.provinceCode,
                address.districtCode,
                address.wardCode
              );
              return {
                ...address,
                provinceName: province,
                districtName: district,
                wardName: ward,
              };
            })
          );
          setLocalAddresses(mappedAddresses);
          setAddresses(mappedAddresses);
          const defaultAddress = mappedAddresses.find((addr) => addr.isDefault);
          if (defaultAddress && formikRef.current) {
            formikRef.current.setValues({
              ...formikRef.current.values,
              addressId: defaultAddress._id,
              fullName: defaultAddress.receiverName,
              phone: defaultAddress.receiverPhone,
            });
          } else {
            setNotification({
              message: 'Không có địa chỉ mặc định. Vui lòng chọn hoặc thêm địa chỉ.',
              type: 'error',
            });
            setShowAddressModal(true);
          }
        } else {
          setNotification({
            message: 'Không có địa chỉ giao hàng. Vui lòng thêm địa chỉ mới.',
            type: 'error',
          });
          setShowAddressModal(true);
        }
      } catch (error) {
        console.error('Lỗi tải địa chỉ:', error);
        setNotification({ message: 'Không thể tải danh sách địa chỉ: ' + error.message, type: 'error' });
        setShowAddressModal(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  const renderAddressItem = ({ item }) => (
    <TouchableOpacity
      style={styles.addressItem}
      onPress={() => {
        setShowAddressModal(false);
        formikRef.current?.setValues({
          ...formikRef.current.values,
          addressId: item._id,
          fullName: item.receiverName,
          phone: item.receiverPhone,
        });
      }}
    >
      <Text style={styles.addressText}>
        {item.receiverName} - {item.receiverPhone}
      </Text>
      <Text style={styles.addressText}>
        {item.addressDetailDescription}, {item.wardName}, {item.districtName}, {item.provinceName}
      </Text>
      {item.isDefault && <Text style={styles.defaultText}>Mặc định</Text>}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowAddressModal(true)}
      >
        <Text style={formikRef.current?.values.addressId ? styles.inputText : styles.placeholderText}>
          {addresses.find((addr) => addr._id === formikRef.current?.values.addressId)
            ? `${addresses.find((addr) => addr._id === formikRef.current?.values.addressId).receiverName} - ${
                addresses.find((addr) => addr._id === formikRef.current?.values.addressId).addressDetailDescription
              }, ${addresses.find((addr) => addr._id === formikRef.current?.values.addressId).wardName}, ${
                addresses.find((addr) => addr._id === formikRef.current?.values.addressId).districtName
              }, ${addresses.find((addr) => addr._id === formikRef.current?.values.addressId).provinceName}`
            : 'Chọn địa chỉ giao hàng'}
        </Text>
        <Icon name="arrow-drop-down" size={24} color="#E53935" />
      </TouchableOpacity>
      <Modal
        visible={showAddressModal}
        animationType="slide"
        onRequestClose={() => {
          if (addresses.length === 0) {
            setNotification({ message: 'Vui lòng thêm địa chỉ mới trước khi tiếp tục.', type: 'error' });
          } else {
            setShowAddressModal(false);
          }
        }}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Chọn địa chỉ giao hàng</Text>
          <FlatList
            data={addresses}
            renderItem={renderAddressItem}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={<Text style={styles.summaryText}>Chưa có địa chỉ nào</Text>}
          />
          <TouchableOpacity
            style={styles.addAddressButton}
            onPress={async () => {
              setShowAddressModal(false);
              const userInfo = await AsyncStorage.getItem('userInfo');
              const accountId = userInfo ? JSON.parse(userInfo).accountId : null;
              if (!accountId) {
                setNotification({ message: 'Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.', type: 'error' });
                return;
              }
              navigation.navigate('DeliveryAddress', {
                accountId,
                onGoBack: async () => {
                  setIsLoading(true);
                  try {
                    const response = await profileService.getDeliveryAddresses();
                    if (response.success && response.data?.length > 0) {
                      const mappedAddresses = await Promise.all(
                        response.data.map(async (address) => {
                          const { province, district, ward } = await mapCodeToName(
                            address.provinceCode,
                            address.districtCode,
                            address.wardCode
                          );
                          return { ...address, provinceName: province, districtName: district, wardName: ward };
                        })
                      );
                      setLocalAddresses(mappedAddresses);
                      setAddresses(mappedAddresses);
                      const defaultAddress = mappedAddresses.find((addr) => addr.isDefault) || mappedAddresses[0];
                      if (defaultAddress && formikRef.current) {
                        formikRef.current.setValues({
                          ...formikRef.current.values,
                          addressId: defaultAddress._id,
                          fullName: defaultAddress.receiverName,
                          phone: defaultAddress.receiverPhone,
                        });
                      }
                    } else {
                      setNotification({ message: 'Không có địa chỉ giao hàng. Vui lòng thử lại.', type: 'error' });
                      setShowAddressModal(true);
                    }
                  } catch (error) {
                    console.error('Lỗi tải địa chỉ:', error);
                    setNotification({ message: 'Không thể tải danh sách địa chỉ: ' + error.message, type: 'error' });
                    setShowAddressModal(true);
                  } finally {
                    setIsLoading(false);
                  }
                },
              });
            }}
          >
            <Text style={styles.addAddressButtonText}>Thêm địa chỉ mới</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              if (addresses.length === 0) {
                setNotification({ message: 'Vui lòng thêm địa chỉ mới trước khi tiếp tục.', type: 'error' });
              } else {
                setShowAddressModal(false);
              }
            }}
          >
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 50,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
    backgroundColor: '#c47385ff',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  addressItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  addressText: {
    fontSize: 15,
    color: '#333',
  },
  defaultText: {
    fontSize: 14,
    color: '#E53935',
    fontWeight: '500',
  },
  addAddressButton: {
    backgroundColor: '#E53935',
    borderRadius: 40,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  addAddressButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#E53935',
    borderRadius: 40,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {  width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryText: {
    fontSize: 16,
    color: '#424242',
    flex: 1,
    flexWrap: 'wrap',
    marginRight: 8,
  },
});

export default AddressHandler;