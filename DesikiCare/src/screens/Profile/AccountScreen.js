import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  FlatList,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import DatePicker from 'react-native-date-picker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import profileService from '../../config/axios/Home/AccountProfile/profileService'; // Adjust path
import Notification from '../../components/Notification'; // Adjust path
import { logout } from '../../redux/authSlice'; // Adjust path

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [profileData, setProfileData] = useState(null);
  const [deliveryAddresses, setDeliveryAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState(null);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [avatarBase64, setAvatarBase64] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    fullName: '',
    phoneNumber: '',
    gender: '',
    dob: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    provinceCode: '',
    districtCode: '',
    wardCode: '',
    addressDetailDescription: '',
    receiverName: '',
    receiverPhone: '',
  });

  // Format date to DD-MM-YYYY for display
  const formatDate = (date) => {
    if (!date) return '';
    return dayjs(date).format('DD-MM-YYYY');
  };

  // Validate date
  const isValidDate = (dateStr) => {
    const [day, month, year] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date.getDate() === day &&
      date.getMonth() + 1 === month &&
      date.getFullYear() === year &&
      year >= 1900 &&
      year <= new Date().getFullYear()
    );
  };

  // Validate profile form
  const validateProfileForm = () => {
    const newErrors = { fullName: '', phoneNumber: '', gender: '', dob: '' };
    let isValid = true;

    if (!fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên.';
      isValid = false;
    } else if (!/^[a-zA-Z\sÀ-ỹ]+$/.test(fullName.trim())) {
      newErrors.fullName = 'Họ và tên chỉ được chứa chữ cái và khoảng cách.';
      isValid = false;
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại.';
      isValid = false;
    } else if (!/^\d{10,15}$/.test(phoneNumber.trim())) {
      newErrors.phoneNumber = 'Số điện thoại phải là 10-15 chữ số.';
      isValid = false;
    }

    if (!gender) {
      newErrors.gender = 'Vui lòng chọn giới tính.';
      isValid = false;
    }

    if (!dob) {
      newErrors.dob = 'Vui lòng chọn ngày sinh.';
      isValid = false;
    } else if (!isValidDate(formatDate(dob))) {
      newErrors.dob = 'Ngày sinh không hợp lệ.';
      isValid = false;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    if (!isValid) {
      setNotification({ message: 'Vui lòng kiểm tra lại thông tin.', type: 'error' });
    }
    return isValid;
  };

  // Validate password form
  const validatePasswordForm = () => {
    const newErrors = { currentPassword: '', newPassword: '', confirmPassword: '' };
    let isValid = true;

    if (!currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.';
      isValid = false;
    }

    if (!newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới.';
      isValid = false;
    } else if (newPassword.length < 6 || /\s/.test(newPassword)) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự và không chứa khoảng cách.';
      isValid = false;
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
      isValid = false;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    if (!isValid) {
      setNotification({ message: 'Vui lòng kiểm tra lại mật khẩu.', type: 'error' });
    }
    return isValid;
  };

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

    setErrors((prev) => ({ ...prev, ...newErrors }));
    if (!isValid) {
      setNotification({ message: 'Vui lòng kiểm tra lại địa chỉ.', type: 'error' });
    }
    return isValid;
  };

  // Fetch profile and addresses
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const profileRes = await profileService.getProfile();
      console.log('Fetch profile result:', profileRes);
      if (profileRes.success && profileRes.data?.account) {
        const { account } = profileRes.data;
        setProfileData(profileRes.data);
        setFullName(account.fullName || '');
        setPhoneNumber(account.phoneNumber || '');
        setGender(account.gender || '');
        setDob(account.dob ? dayjs(account.dob).toDate() : null);
        setPreviewAvatar(account.imageUrl || '');
        setAvatarBase64('');

        // Fetch all delivery addresses
        const addressRes = await profileService.getDeliveryAddresses(account._id);
        console.log('Fetch addresses result:', addressRes);
        if (addressRes.success) {
          setDeliveryAddresses(addressRes.data || []);
        } else {
          setNotification({ message: addressRes.message, type: 'error' });
        }
      } else {
        setNotification({ message: profileRes.message || 'Không thể tải hồ sơ.', type: 'error' });
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
      setNotification({ message: 'Không thể tải thông tin người dùng.', type: 'error' });
    }
    setLoading(false);
  };

  // Update profile
  const handleUpdate = async () => {
    if (!validateProfileForm()) return;
    setLoading(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        gender: gender.toLowerCase(),
        dob: dob ? dayjs(dob).format('YYYY-MM-DD') : null,
        email: profileData?.account?.email || '',
        imageBase64: avatarBase64 || '',
      };
      const res = await profileService.updateAccount(payload);
      console.log('Update profile result:', res);
      if (res.success) {
        setNotification({ message: 'Cập nhật thông tin thành công!', type: 'success' });
        await fetchProfile();
      } else {
        setNotification({ message: res.message || 'Cập nhật thất bại.', type: 'error' });
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setNotification({ message: 'Cập nhật thất bại.', type: 'error' });
    }
    setLoading(false);
  };

  // Change password
  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;
    setLoading(true);
    try {
      const res = await profileService.changePassword(currentPassword, newPassword);
      console.log('Change password result:', res);
      if (res.success) {
        setNotification({ message: 'Đổi mật khẩu thành công!', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setNotification({ message: res.message || 'Đổi mật khẩu thất bại.', type: 'error' });
      }
    } catch (error) {
      console.error('Change password error:', error);
      setNotification({ message: 'Đổi mật khẩu thất bại.', type: 'error' });
    }
    setLoading(false);
  };

  // Upload avatar with expo-image-picker
  const handleUploadAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setAvatarBase64(`data:image/jpeg;base64,${asset.base64}`);
        setPreviewAvatar(asset.uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      setNotification({ message: 'Lỗi khi chọn ảnh.', type: 'error' });
    }
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
      const res = await profileService.addDeliveryAddress(profileData.account._id, payload);
      console.log('Add address result:', res);
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
        setNotification({ message: res.message || 'Thêm địa chỉ thất bại.', type: 'error' });
      }
    } catch (error) {
      console.error('Add address error:', error);
      setNotification({ message: 'Thêm địa chỉ thất bại.', type: 'error' });
    }
    setLoading(false);
  };

  // Set default address
  const handleSetDefaultAddress = async (deliveryAddressId) => {
    setLoading(true);
    try {
      const res = await profileService.setDefaultDeliveryAddress(deliveryAddressId);
      console.log('Set default address result:', res);
      if (res.success) {
        setNotification({ message: 'Đặt địa chỉ mặc định thành công!', type: 'success' });
        await fetchProfile();
      } else {
        setNotification({ message: res.message || 'Đặt địa chỉ mặc định thất bại.', type: 'error' });
      }
    } catch (error) {
      console.error('Set default address error:', error);
      setNotification({ message: 'Đặt địa chỉ mặc định thất bại.', type: 'error' });
    }
    setLoading(false);
  };

  // Delete address
  const handleDeleteAddress = (deliveryAddressId) => {
    Alert.alert('Xóa địa chỉ', 'Bạn có chắc muốn xóa địa chỉ này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            const res = await profileService.deleteDeliveryAddress(deliveryAddressId);
            console.log('Delete address result:', res);
            if (res.success) {
              setNotification({ message: 'Xóa địa chỉ thành công!', type: 'success' });
              await fetchProfile();
            } else {
              setNotification({ message: res.message || 'Xóa địa chỉ thất bại.', type: 'error' });
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

  // Logout
  const handleLogout = async () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('userToken');
            dispatch(logout());
            navigation.replace('Login');
          } catch (error) {
            console.error('Logout error:', error);
            setNotification({ message: 'Không thể đăng xuất. Vui lòng thử lại.', type: 'error' });
          }
        },
      },
    ]);
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loginPrompt}>Vui lòng đăng nhập để xem thông tin.</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginButton}>
          <Text style={styles.loginText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading && !profileData) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loginPrompt}>Đang tải...</Text>
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loginPrompt}>Không thể tải thông tin. Vui lòng thử lại.</Text>
        <TouchableOpacity onPress={fetchProfile} style={styles.resetButton}>
          <Text style={styles.resetText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { account } = profileData;

  // Render delivery address item
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
    <ScrollView style={styles.container}>
      <Notification
        message={notification?.message}
        type={notification?.type}
        onDismiss={() => setNotification(null)}
      />
      {/* Header Section */}
      <View style={styles.headerSection}>
        <TouchableOpacity
          onPress={handleUploadAvatar}
          accessible={true}
          accessibilityLabel="Chọn ảnh đại diện"
        >
          <Image
            source={{ uri: previewAvatar || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <Text style={styles.username}>{fullName || 'Khách hàng'}</Text>
        <Text style={styles.emailText}>{account.emailAddress}</Text>
        <Text style={styles.points}>Điểm: {account.points || 0}</Text>
      </View>

      {/* Profile Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
        <View style={[styles.inputContainer, { borderColor: errors.fullName ? 'red' : '#B0BEC5' }]}>
          <Icon name="person" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Họ và tên"
            value={fullName}
            onChangeText={setFullName}
            accessible={true}
            accessibilityLabel="Nhập họ và tên"
          />
        </View>
        {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
        <View style={[styles.inputContainer, { borderColor: errors.phoneNumber ? 'red' : '#B0BEC5' }]}>
          <Icon name="phone" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Số điện thoại"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="numeric"
            accessible={true}
            accessibilityLabel="Nhập số điện thoại"
          />
        </View>
        {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
        <View style={[styles.inputContainer, { borderColor: errors.gender ? 'red' : '#B0BEC5' }]}>
          <Icon name="wc" size={24} color="#666" style={styles.inputIcon} />
          <Picker
            selectedValue={gender}
            onValueChange={setGender}
            style={styles.picker}
            accessible={true}
            accessibilityLabel="Chọn giới tính"
          >
            <Picker.Item label="Chọn giới tính" value="" />
            <Picker.Item label="Nam" value="nam" />
            <Picker.Item label="Nữ" value="nữ" />
            <Picker.Item label="Khác" value="khác" />
          </Picker>
        </View>
        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
        <TouchableOpacity
          style={[styles.inputContainer, { borderColor: errors.dob ? 'red' : '#B0BEC5' }]}
          onPress={() => setOpenDatePicker(true)}
          accessible={true}
          accessibilityLabel="Chọn ngày sinh"
        >
          <Icon name="calendar-today" size={24} color="#666" style={styles.inputIcon} />
          <Text style={[styles.input, styles.modalText]}>{dob ? formatDate(dob) : 'Chọn ngày sinh'}</Text>
        </TouchableOpacity>
        {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}
        <DatePicker
          modal
          open={openDatePicker}
          date={dob || new Date()}
          mode="date"
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
          onConfirm={(date) => {
            setOpenDatePicker(false);
            setDob(date);
          }}
          onCancel={() => setOpenDatePicker(false)}
          locale="vi"
          title="Chọn ngày sinh"
          confirmText="Xác nhận"
          cancelText="Hủy"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleUpdate}
          accessible={true}
          accessibilityLabel="Cập nhật thông tin cá nhân"
        >
          <Text style={styles.buttonText}>Cập nhật</Text>
        </TouchableOpacity>
      </View>

      {/* Password Change Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Đổi mật khẩu</Text>
        <View style={[styles.inputContainer, { borderColor: errors.currentPassword ? 'red' : '#B0BEC5' }]}>
          <Icon name="lock" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu hiện tại"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            accessible={true}
            accessibilityLabel="Nhập mật khẩu hiện tại"
          />
        </View>
        {errors.currentPassword && <Text style={styles.errorText}>{errors.currentPassword}</Text>}
        <View style={[styles.inputContainer, { borderColor: errors.newPassword ? 'red' : '#B0BEC5' }]}>
          <Icon name="lock" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            accessible={true}
            accessibilityLabel="Nhập mật khẩu mới"
          />
        </View>
        {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
        <View style={[styles.inputContainer, { borderColor: errors.confirmPassword ? 'red' : '#B0BEC5' }]}>
          <Icon name="lock" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            accessible={true}
            accessibilityLabel="Xác nhận mật khẩu mới"
          />
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        <TouchableOpacity
          style={styles.button}
          onPress={handleChangePassword}
          accessible={true}
          accessibilityLabel="Đổi mật khẩu"
        >
          <Text style={styles.buttonText}>Đổi mật khẩu</Text>
        </TouchableOpacity>
      </View>

      {/* Delivery Addresses Section */}
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

      {/* Add New Address Section */}
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
        {errors.addressDetailDescription && (
          <Text style={styles.errorText}>{errors.addressDetailDescription}</Text>
        )}
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
            keyboardType="numeric"
            accessible={true}
            accessibilityLabel="Nhập số điện thoại người nhận"
          />
        </View>
        {errors.receiverPhone && <Text style={styles.errorText}>{errors.receiverPhone}</Text>}
        <TouchableOpacity
          style={styles.button}
          onPress={handleAddAddress}
          accessible={true}
          accessibilityLabel="Thêm địa chỉ mới"
        >
          <Text style={styles.buttonText}>Thêm địa chỉ</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        accessible={true}
        accessibilityLabel="Đăng xuất"
      >
        <Icon name="logout" size={20} color="#fff" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPrompt: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
  },
  resetText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  emailText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  points: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B0BEC5',
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  picker: {
    flex: 1,
    height: 48,
    color: '#333',
  },
  modalText: {
    color: '#333',
    fontSize: 16,
    flex: 16,
    lineHeight: 48,
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    marginBottom: 8,
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addressList: {
    marginBottom: 12,
  },
  addressItem: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  addressContent: {
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  defaultBadge: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
  },
  noAddressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5722',
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ProfileScreen;