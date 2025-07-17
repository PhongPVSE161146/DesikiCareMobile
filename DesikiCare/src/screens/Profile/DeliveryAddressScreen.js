import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Switch, FlatList } from 'react-native';
import RNModal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import profileService from '../../config/axios/Home/AccountProfile/profileService';
import Notification from '../../components/Notification';
import styles from './styles';

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

  // Ánh xạ mã sang tên
  const mapCodeToName = async (provinceCode, districtCode, wardCode) => {
    try {
      const province = provinces.find((p) => p.code === Number(provinceCode))?.name || provinceCode;
      const districtResponse = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      const district = districtResponse.data.districts.find((d) => d.code === Number(districtCode))?.name || districtCode;
      const wardResponse = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
      const ward = wardResponse.data.wards.find((w) => w.code === Number(wardCode))?.name || wardCode;
      return { province, district, ward };
    } catch (error) {
      console.error('Map code to name error:', error);
      return { province: provinceCode, district: districtCode, ward: wardCode };
    }
  };

  const fetchProvinces = async () => {
    try {
      const response = await axios.get('https://provinces.open-api.vn/api/p/');
      setProvinces(response.data);
    } catch (error) {
      console.error('Fetch provinces error:', error);
      setNotification({ message: 'Không thể tải danh sách tỉnh/thành phố.', type: 'error' });
    }
  };

  const fetchDistricts = async (provinceCode) => {
    try {
      const response = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      setDistricts(response.data.districts || []);
      setWards([]);
    } catch (error) {
      console.error('Fetch districts error:', error);
      setNotification({ message: 'Không thể tải danh sách quận/huyện.', type: 'error' });
    }
  };

  const fetchWards = async (districtCode) => {
    try {
      const response = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
      setWards(response.data.wards || []);
    } catch (error) {
      console.error('Fetch wards error:', error);
      setNotification({ message: 'Không thể tải danh sách phường/xã.', type: 'error' });
    }
  };

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await profileService.getDeliveryAddresses();
      console.log('Fetched addresses response:', JSON.stringify(response, null, 2));
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
        console.log('Mapped addresses:', JSON.stringify(mappedAddresses, null, 2));
        setAddresses(mappedAddresses);
      } else {
        setNotification({ message: response.message || 'Không thể tải danh sách địa chỉ.', type: 'error' });
      }
    } catch (error) {
      console.error('Fetch addresses error:', error);
      setNotification({ message: 'Không thể tải danh sách địa chỉ.', type: 'error' });
    }
    setLoading(false);
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
      console.log('Adding address with payload:', JSON.stringify(payload, null, 2));
      const response = await profileService.addDeliveryAddress(accountId, payload);
      console.log('Add address response:', JSON.stringify(response, null, 2));
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
        await fetchAddresses(); // Gọi lại để làm mới danh sách
      } else {
        setNotification({ message: response.message || 'Thêm địa chỉ thất bại.', type: 'error' });
      }
    } catch (error) {
      console.error('Add address error:', error);
      setNotification({ message: 'Thêm địa chỉ thất bại.', type: 'error' });
    }
    setLoading(false);
  };

  const handleSetDefault = async (addressId) => {
    setLoading(true);
    try {
      const response = await profileService.setDefaultDeliveryAddress(addressId);
      console.log('Set default address response:', JSON.stringify(response, null, 2));
      if (response.success) {
        setNotification({ message: 'Đặt địa chỉ mặc định thành công!', type: 'success' });
        await fetchAddresses();
      } else {
        setNotification({ message: response.message || 'Đặt địa chỉ mặc định thất bại.', type: 'error' });
      }
    } catch (error) {
      console.error('Set default address error:', error);
      setNotification({ message: 'Đặt địa chỉ mặc định thất bại.', type: 'error' });
    }
    setLoading(false);
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
            console.log('Delete address response:', JSON.stringify(response, null, 2));
            if (response.success) {
              setNotification({ message: 'Xóa địa chỉ thành công!', type: 'success' });
              await fetchAddresses();
            } else {
              setNotification({ message: response.message || 'Xóa địa chỉ thất bại.', type: 'error' });
            }
          } catch (error) {
            console.error('Delete address error:', error);
            setNotification({ message: 'Xóa địa chỉ thất bại.', type: 'error' });
          }
          setLoading(false);
        },
      },
    ]);
  };

  // Xử lý chọn tỉnh/quận/xã
  const renderItem = ({ item, type }) => {
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
            fetchDistricts(item.code);
          } else if (type === 'district') {
            setNewAddress({
              ...newAddress,
              district: { name: item.name, code: item.code },
              ward: { name: '', code: '' },
            });
            fetchWards(item.code);
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
  };

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

  useEffect(() => {
    if (accountId) {
      fetchAddresses();
      fetchProvinces();
    }
  }, [accountId]);

  if (loading && addresses.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF69B4" />
        <Text style={styles.loginPrompt}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
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
                {address.receiverName} - <Text style={styles.infoLabel}>SĐT: </Text>{address.receiverPhone}
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Địa chỉ: </Text>
                {address.addressDetailDescription}, {address.wardName}, {address.districtName}, {address.provinceName}
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
            <Text style={newAddress.province.name ? styles.infoText : styles.infoText}>
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
            <Text style={newAddress.district.name ? styles.infoText : styles.infoText}>
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
            <Text style={newAddress.ward.name ? styles.infoText : styles.infoText}>
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
  );
};

export default DeliveryAddressScreen;