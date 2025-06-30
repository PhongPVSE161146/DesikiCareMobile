import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native'; // Thêm TouchableOpacity
import profileService from '../../config/axios/Home/AccountProfile/profileService';
import styles from './styles';

const AddAddressSection = ({
  profileData,
  fetchProfile,
  setNotification,
  handleUnauthorized,
  loading,
  setLoading,
}) => {
  const [newAddress, setNewAddress] = useState({
    provinceCode: '',
    districtCode: '',
    wardCode: '',
    addressDetailDescription: '',
    receiverName: '',
    receiverPhone: '',
    isDefault: true,
  });
  const [errors, setErrors] = useState({
    provinceCode: '',
    districtCode: '',
    wardCode: '',
    addressDetailDescription: '',
    receiverName: '',
    receiverPhone: '',
  });

  // Validate address form
  const validateAddressForm = () => {
    const newErrors = {
      provinceCode: '',
      districtCode: '',
      wardCode: '',
      addressDetailDescription: '',
      receiverName: '',
      receiverPhone: '',
    };
    let isValid = true;

    if (!newAddress.provinceCode.trim()) {
      newErrors.provinceCode = 'Vui lòng nhập mã tỉnh/thành phố.';
      isValid = false;
    }

    if (!newAddress.districtCode.trim()) {
      newErrors.districtCode = 'Vui lòng nhập mã quận/huyện.';
      isValid = false;
    }

    if (!newAddress.wardCode.trim()) {
      newErrors.wardCode = 'Vui lòng nhập mã phường/xã.';
      isValid = false;
    }

    if (!newAddress.addressDetailDescription.trim()) {
      newErrors.addressDetailDescription = 'Vui lòng nhập địa chỉ chi tiết.';
      isValid = false;
    }

    if (!newAddress.receiverName.trim()) {
      newErrors.receiverName = 'Vui lòng nhập tên người nhận.';
      isValid = false;
    }

    if (!newAddress.receiverPhone.trim()) {
      newErrors.receiverPhone = 'Vui lòng nhập số điện thoại người nhận.';
      isValid = false;
    } else if (!/^\d{10,15}$/.test(newAddress.receiverPhone.trim())) {
      newErrors.receiverPhone = 'Số điện thoại phải là 10-15 chữ số.';
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) {
      setNotification({ message: 'Vui lòng kiểm tra lại địa chỉ.', type: 'error' });
    }
    return isValid;
  };

  // Add new address
  const handleAddAddress = async () => {
    if (!validateAddressForm()) return;
    if (!profileData?.account?._id) {
      setNotification({ message: 'Không tìm thấy ID tài khoản.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        provinceCode: newAddress.provinceCode.trim(),
        districtCode: newAddress.districtCode.trim(),
        wardCode: newAddress.wardCode.trim(),
        addressDetailDescription: newAddress.addressDetailDescription.trim(),
        receiverName: newAddress.receiverName.trim(),
        receiverPhone: newAddress.receiverPhone.trim(),
        isDefault: newAddress.isDefault,
      };
      const res = await profileService.addDeliveryAddress(profileData.account._id, payload, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });
      if (res.success) {
        setNotification({ message: 'Thêm địa chỉ thành công!', type: 'success' });
        setNewAddress({
          provinceCode: '',
          districtCode: '',
          wardCode: '',
          addressDetailDescription: '',
          receiverName: '',
          receiverPhone: '',
          isDefault: true,
        });
        await fetchProfile();
      } else {
        if (res.message.includes('hết hạn') || res.message.includes('token')) {
          await handleUnauthorized(res.message);
        } else {
          setNotification({ message: res.message || 'Thêm địa chỉ thất bại.', type: 'error' });
        }
      }
    } catch (error) {
      console.error('Add address error:', error);
      setNotification({ message: 'Thêm địa chỉ thất bại.', type: 'error' });
    }
    setLoading(false);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Thêm địa chỉ mới</Text>
      <View style={[styles.inputContainer, { borderColor: errors.provinceCode ? 'red' : '#B0BEC5' }]}>
        <TextInput
          style={styles.input}
          placeholder="Mã tỉnh/thành phố"
          value={newAddress.provinceCode}
          onChangeText={(text) => setNewAddress({ ...newAddress, provinceCode: text })}
          accessible={true}
          accessibilityLabel="Nhập mã tỉnh/thành phố"
        />
      </View>
      {errors.provinceCode && <Text style={styles.errorText}>{errors.provinceCode}</Text>}
      <View style={[styles.inputContainer, { borderColor: errors.districtCode ? 'red' : '#B0BEC5' }]}>
        <TextInput
          style={styles.input}
          placeholder="Mã quận/huyện"
          value={newAddress.districtCode}
          onChangeText={(text) => setNewAddress({ ...newAddress, districtCode: text })}
          accessible={true}
          accessibilityLabel="Nhập mã quận/huyện"
        />
      </View>
      {errors.districtCode && <Text style={styles.errorText}>{errors.districtCode}</Text>}
      <View style={[styles.inputContainer, { borderColor: errors.wardCode ? 'red' : '#B0BEC5' }]}>
        <TextInput
          style={styles.input}
          placeholder="Mã phường/xã"
          value={newAddress.wardCode}
          onChangeText={(text) => setNewAddress({ ...newAddress, wardCode: text })}
          accessible={true}
          accessibilityLabel="Nhập mã phường/xã"
        />
      </View>
      {errors.wardCode && <Text style={styles.errorText}>{errors.wardCode}</Text>}
      <View
        style={[styles.inputContainer, { borderColor: errors.addressDetailDescription ? 'red' : '#B0BEC5' }]}
      >
        <TextInput
          style={styles.input}
          placeholder="Địa chỉ chi tiết"
          value={newAddress.addressDetailDescription}
          onChangeText={(text) => setNewAddress({ ...newAddress, addressDetailDescription: text })}
          accessible={true}
          accessibilityLabel="Nhập địa chỉ chi tiết"
        />
      </View>
      {errors.addressDetailDescription && <Text style={styles.errorText}>{errors.addressDetailDescription}</Text>}
      <View style={[styles.inputContainer, { borderColor: errors.receiverName ? 'red' : '#B0BEC5' }]}>
        <TextInput
          style={styles.input}
          placeholder="Tên người nhận"
          value={newAddress.receiverName}
          onChangeText={(text) => setNewAddress({ ...newAddress, receiverName: text })}
          accessible={true}
          accessibilityLabel="Nhập tên người nhận"
        />
      </View>
      {errors.receiverName && <Text style={styles.errorText}>{errors.receiverName}</Text>}
      <View style={[styles.inputContainer, { borderColor: errors.receiverPhone ? 'red' : '#B0BEC5' }]}>
        <TextInput
          style={styles.input}
          placeholder="Số điện thoại người nhận"
          value={newAddress.receiverPhone}
          onChangeText={(text) => setNewAddress({ ...newAddress, receiverPhone: text })}
          keyboardType="phone-pad"
          accessible={true}
          accessibilityLabel="Nhập số điện thoại người nhận"
        />
      </View>
      {errors.receiverPhone && <Text style={styles.errorText}>{errors.receiverPhone}</Text>}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleAddAddress}
        disabled={loading}
        accessible={true}
        accessibilityLabel="Thêm địa chỉ mới"
      >
        <Text style={styles.buttonText}>Thêm địa chỉ</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddAddressSection;