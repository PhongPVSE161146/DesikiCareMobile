import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  FlatList,
  SafeAreaView,
} from 'react-native';
import RNModal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import profileService from '../../config/axios/Home/AccountProfile/profileService';
import Notification from '../../components/Notification';
import styles from './styles';

// In-memory cache for provinces, districts, and wards
const cache = {
  provinces: null,
  districts: {},
  wards: {},
};

const DeliveryAddressScreen = ({ navigation, route }) => {
  const { accountId } = route.params || {};
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [newAddress, setNewAddress] = useState({
    province: { name: '', code: '' },
    district: { name: '', code: '' },
    ward: { name: '', code: '' },
    addressDetailDescription: '',
    receiverName: '',
    receiverPhone: '',
    isDefault: true,
  });
  const [modalVisible, setModalVisible] = useState({ province: false, district: false, ward: false });
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch functions with caching
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

  const fetchProvinces = async () => {
    try {
      if (!cache.provinces) {
        const response = await axios.get('https://provinces.open-api.vn/api/p/');
        cache.provinces = response.data || [];
      }
      setProvinces(cache.provinces);
    } catch (error) {
      console.error('Lỗi tải danh sách tỉnh/thành phố:', error);
      setNotification({ message: 'Không thể tải danh sách tỉnh/thành phố.', type: 'error' });
    }
  };

  const fetchDistricts = async (provinceCode) => {
    try {
      const pCode = Number(provinceCode);
      if (!cache.districts[pCode]) {
        const response = await axios.get(`https://provinces.open-api.vn/api/p/${pCode}?depth=2`);
        cache.districts[pCode] = response.data.districts || [];
      }
      setDistricts(cache.districts[pCode]);
      setWards([]);
    } catch (error) {
      console.error('Lỗi tải danh sách quận/huyện:', error);
      setNotification({ message: 'Không thể tải danh sách quận/huyện.', type: 'error' });
    }
  };

  const fetchWards = async (districtCode) => {
    try {
      const dCode = Number(districtCode);
      if (!cache.wards[dCode]) {
        const response = await axios.get(`https://provinces.open-api.vn/api/d/${dCode}?depth=2`);
        cache.wards[dCode] = response.data.wards || [];
      }
      setWards(cache.wards[dCode]);
    } catch (error) {
      console.error('Lỗi tải danh sách phường/xã:', error);
      setNotification({ message: 'Không thể tải danh sách phường/xã.', type: 'error' });
    }
  };

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      if (!cache.provinces) {
        await fetchProvinces();
      }
      const response = await profileService.getDeliveryAddresses();
      console.log('Kết quả tải địa chỉ:', JSON.stringify(response, null, 2));
      if (response.success) {
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
        console.log('Địa chỉ đã ánh xạ:', JSON.stringify(mappedAddresses, null, 2));
        setAddresses(mappedAddresses);
      } else {
        setNotification({ message: response.message || 'Không thể tải danh sách địa chỉ.', type: 'error' });
      }
    } catch (error) {
      console.error('Lỗi tải địa chỉ:', error);
      setNotification({ message: 'Không thể tải danh sách địa chỉ.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const validateAddress = (address) => {
    const { province, district, ward, addressDetailDescription, receiverName, receiverPhone } = address;
    if (!province.code || !district.code || !ward.code || !addressDetailDescription || !receiverName || !receiverPhone) {
      return { isValid: false, message: 'Vui lòng điền đầy đủ tất cả các trường.' };
    }
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(receiverPhone)) {
      return { isValid: false, message: 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại 10 chữ số bắt đầu bằng 0.' };
    }
    return { isValid: true };
  };

  const handleAddAddress = async () => {
    const validation = validateAddress(newAddress);
    if (!validation.isValid) {
      setNotification({ message: validation.message, type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        provinceCode: newAddress.province.code,
        districtCode: newAddress.district.code,
        wardCode: newAddress.ward.code,
        addressDetailDescription: newAddress.addressDetailDescription,
        receiverName: newAddress.receiverName,
        receiverPhone: newAddress.receiverPhone,
        isDefault: newAddress.isDefault,
      };
      console.log('Thêm địa chỉ với payload:', JSON.stringify(payload, null, 2));
      const response = await profileService.addDeliveryAddress(accountId, payload);
      console.log('Kết quả thêm địa chỉ:', JSON.stringify(response, null, 2));
      if (response.success) {
        setNotification({ message: 'Thêm địa chỉ thành công!', type: 'success' });
        setNewAddress({
          province: { name: '', code: '' },
          district: { name: '', code: '' },
          ward: { name: '', code: '' },
          addressDetailDescription: '',
          receiverName: '',
          receiverPhone: '',
          isDefault: true,
        });
        setIsAdding(false);
        await fetchAddresses();
      } else {
        setNotification({ message: response.message || 'Thêm địa chỉ thất bại.', type: 'error' });
      }
    } catch (error) {
      console.error('Lỗi thêm địa chỉ:', error);
      setNotification({ message: 'Thêm địa chỉ thất bại.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    setLoading(true);
    try {
      const response = await profileService.setDefaultDeliveryAddress(addressId);
      console.log('Kết quả đặt địa chỉ mặc định:', JSON.stringify(response, null, 2));
      if (response.success) {
        setNotification({ message: 'Đặt địa chỉ mặc định thành công!', type: 'success' });
        await fetchAddresses();
      } else {
        setNotification({ message: response.message || 'Đặt địa chỉ mặc định thất bại.', type: 'error' });
      }
    } catch (error) {
      console.error('Lỗi đặt địa chỉ mặc định:', error);
      setNotification({ message: 'Đặt địa chỉ mặc định thất bại.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    Alert.alert('Xóa địa chỉ', 'Bạn có chắc muốn xóa địa chỉ này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            const response = await profileService.deleteDeliveryAddress(addressId);
            console.log('Kết quả xóa địa chỉ:', JSON.stringify(response, null, 2));
            if (response.success) {
              setNotification({ message: 'Xóa địa chỉ thành công!', type: 'success' });
              await fetchAddresses();
            } else {
              setNotification({ message: response.message || 'Xóa địa chỉ thất bại.', type: 'error' });
            }
          } catch (error) {
            console.error('Lỗi xóa địa chỉ:', error);
            setNotification({ message: 'Xóa địa chỉ thất bại.', type: 'error' });
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const renderItem = useCallback(
    ({ item, type }) => {
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return null;
      }
      return (
        <TouchableOpacity
          style={styles.optionItem}
          onPress={() => {
            if (type === 'province') {
              setNewAddress({
                ...newAddress,
                province: { name: item.name, code: item.code },
                district: { name: '', code: '' },
                ward: { name: '', code: '' },
              });
              setTimeout(() => fetchDistricts(item.code), 0); // Defer to avoid render conflict
            } else if (type === 'district') {
              setNewAddress({
                ...newAddress,
                district: { name: item.name, code: item.code },
                ward: { name: '', code: '' },
              });
              setTimeout(() => fetchWards(item.code), 0); // Defer to avoid render conflict
            } else {
              setNewAddress({ ...newAddress, ward: { name: item.name, code: item.code } });
            }
            setModalVisible({ province: false, district: false, ward: false });
            setSearchQuery('');
          }}
        >
          <Text style={styles.optionText}>{item.name}</Text>
        </TouchableOpacity>
      );
    },
    [searchQuery, newAddress]
  );

  const renderModal = (type, data, title) => (
    <RNModal
      isVisible={modalVisible[type]}
      onBackdropPress={() => setModalVisible({ ...modalVisible, [type]: false })}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View style={styles.optionBox}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TextInput
          style={styles.input}
          placeholder="Tìm kiếm..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FlatList
          data={data}
          keyExtractor={(item) => item.code.toString()}
          renderItem={({ item }) => renderItem({ item, type })}
          ListEmptyComponent={<Text style={styles.optionText}>Không tìm thấy</Text>}
          style={{ maxHeight: 300 }}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
        />
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setModalVisible({ ...modalVisible, [type]: false })}
        >
          <Text style={styles.buttonText}>Đóng</Text>
        </TouchableOpacity>
      </View>
    </RNModal>
  );

  // Use useCallback to stabilize fetchAddresses
  const fetchAddressesCallback = useCallback(async () => {
    await fetchAddresses();
  }, []);

  // UseEffect with deferred updates
  useEffect(() => {
    if (accountId) {
      // Defer to next tick to avoid render phase updates
      const timer = setTimeout(() => {
        fetchProvinces().then(fetchAddressesCallback);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [accountId, fetchAddressesCallback]);

  if (loading && addresses.length === 0) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#FF69B4" />
        <Text style={styles.loginPrompt}>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Notification
          message={notification?.message}
          type={notification?.type}
          onDismiss={() => setNotification(null)}
        />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh sách địa chỉ giao hàng</Text>
          {addresses.length === 0 ? (
            <Text style={styles.infoText}>Chưa có địa chỉ nào.</Text>
          ) : (
            addresses.map((address) => (
              <View key={address._id} style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  <Text style={styles.infoLabel}>Tên: </Text>
                  {address.receiverName} - <Text style={styles.infoLabel}>SĐT: </Text>
                  {address.receiverPhone}
                </Text>
                <Text style={styles.infoText}>
                  <Text style={styles.infoLabel}>Địa chỉ: </Text>
                  {address.addressDetailDescription}, {address.wardName}, {address.districtName},{' '}
                  {address.provinceName}
                </Text>
                <Text style={[styles.infoText, address.isDefault ? styles.defaultText : {}]}>
                  {address.isDefault ? 'Mặc định' : 'Không phải mặc định'}
                </Text>
                <View style={styles.buttonContainer}>
                  {!address.isDefault && (
                    <TouchableOpacity
                      style={[styles.button, styles.saveButton]}
                      onPress={() => handleSetDefault(address._id)}
                      disabled={loading}
                    >
                      <Text style={styles.buttonText}>Đặt làm mặc định</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => handleDeleteAddress(address._id)}
                    disabled={loading}
                  >
                    <Text style={styles.buttonText}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={() => setIsAdding(true)}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Thêm địa chỉ mới</Text>
          </TouchableOpacity>
        </View>
        {isAdding && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thêm địa chỉ mới</Text>
            <Text style={styles.label}>Tên người nhận</Text>
            <TextInput
              style={styles.input}
              value={newAddress.receiverName}
              onChangeText={(text) => setNewAddress({ ...newAddress, receiverName: text })}
              placeholder="Nhập tên người nhận"
              placeholderTextColor="#999"
            />
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              value={newAddress.receiverPhone}
              onChangeText={(text) => setNewAddress({ ...newAddress, receiverPhone: text })}
              placeholder="Nhập số điện thoại (VD: 0123456789)"
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
            <Text style={styles.label}>Tỉnh/Thành phố</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setModalVisible({ ...modalVisible, province: true })}
            >
              <Text style={newAddress.province.name ? styles.infoText : styles.placeholderText}>
                {newAddress.province.name || 'Chọn tỉnh/thành phố'}
              </Text>
              <Icon name="arrow-drop-down" size={24} color="#C71585" />
            </TouchableOpacity>
            {renderModal('province', provinces, 'Chọn Tỉnh/Thành phố')}
            <Text style={styles.label}>Quận/Huyện</Text>
            <TouchableOpacity
              style={[styles.input, { opacity: districts.length === 0 ? 0.5 : 1 }]}
              onPress={() => districts.length > 0 && setModalVisible({ ...modalVisible, district: true })}
              disabled={districts.length === 0}
            >
              <Text style={newAddress.district.name ? styles.infoText : styles.placeholderText}>
                {newAddress.district.name || 'Chọn quận/huyện'}
              </Text>
              <Icon name="arrow-drop-down" size={24} color="#C71585" />
            </TouchableOpacity>
            {renderModal('district', districts, 'Chọn Quận/Huyện')}
            <Text style={styles.label}>Phường/Xã</Text>
            <TouchableOpacity
              style={[styles.input, { opacity: wards.length === 0 ? 0.5 : 1 }]}
              onPress={() => wards.length > 0 && setModalVisible({ ...modalVisible, ward: true })}
              disabled={wards.length === 0}
            >
              <Text style={newAddress.ward.name ? styles.infoText : styles.placeholderText}>
                {newAddress.ward.name || 'Chọn phường/xã'}
              </Text>
              <Icon name="arrow-drop-down" size={24} color="#C71585" />
            </TouchableOpacity>
            {renderModal('ward', wards, 'Chọn Phường/Xã')}
            <Text style={styles.label}>Địa chỉ chi tiết</Text>
            <TextInput
              style={styles.input}
              value={newAddress.addressDetailDescription}
              onChangeText={(text) => setNewAddress({ ...newAddress, addressDetailDescription: text })}
              placeholder="Nhập địa chỉ chi tiết"
              placeholderTextColor="#999"
            />
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Đặt làm địa chỉ mặc định</Text>
              <Switch
                value={newAddress.isDefault}
                onValueChange={(value) => setNewAddress({ ...newAddress, isDefault: value })}
                trackColor={{ false: '#FFC1CC', true: '#FF69B4' }}
                thumbColor={newAddress.isDefault ? '#fff' : '#FFF0F5'}
              />
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleAddAddress}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsAdding(false)}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DeliveryAddressScreen;