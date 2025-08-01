import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image, Platform, SafeAreaView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import profileService from '../../config/axios/Home/AccountProfile/profileService';
import { logout } from '../../redux/authSlice';
import Notification from '../../components/NotiComponnets/Notification';
import styles from './styles';


const cache = {
  provinces: null,
  districts: {},
  wards: {},
};

const formatDateToDDMMYYYY = (isoDate) => {
  if (!isoDate) return '';
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '';
  }
};

const formatDateToYYYYMMDD = (isoDate) => {
  if (!isoDate) return '';
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [profileData, setProfileData] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showGenderOptions, setShowGenderOptions] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    dob: '',
    gender: '',
    imageBase64: '',
    password: '',
    roleId: 0,
  });

  const handleUnauthorized = async (message) => {
    setNotification({ message, type: 'error' });
    await AsyncStorage.removeItem('userToken');
    dispatch(logout());
    navigation.replace('Login');
  };

  const fetchProvinces = async () => {
    try {
      if (!cache.provinces) {
        const response = await axios.get('https://provinces.open-api.vn/api/p/');
        cache.provinces = response.data || [];
      }
      setProvinces(cache.provinces);
    } catch (error) {
      console.error('Fetch provinces error:', error);
      setNotification({ message: 'Không thể tải danh sách tỉnh/thành phố.', type: 'error' });
    }
  };

  const mapCodeToName = async (provinceCode, districtCode, wardCode) => {
    try {
      const pCode = Number(provinceCode);
      const dCode = Number(districtCode);
      const wCode = Number(wardCode);

      if (!cache.provinces) {
        const response = await axios.get('https://provinces.open-api.vn/api/p/');
        cache.provinces = response.data || [];
      }
      const province = cache.provinces.find((p) => p.code === pCode)?.name || 'Unknown Province';

      if (!cache.districts[pCode]) {
        const response = await axios.get(`https://provinces.open-api.vn/api/p/${pCode}?depth=2`);
        cache.districts[pCode] = response.data.districts || [];
      }
      const district = cache.districts[pCode].find((d) => d.code === dCode)?.name || 'Unknown District';

      if (!cache.wards[dCode]) {
        const response = await axios.get(`https://provinces.open-api.vn/api/d/${dCode}?depth=2`);
        cache.wards[dCode] = response.data.wards || [];
      }
      const ward = cache.wards[dCode].find((w) => w.code === wCode)?.name || 'Unknown Ward';

      return { province, district, ward };
    } catch (error) {
      console.error('Map code to name error:', error);
      return {
        province: 'Unknown Province',
        district: 'Unknown District',
        ward: 'Unknown Ward',
      };
    }
  };

  const fetchAddresses = async () => {
    try {
      if (!cache.provinces) {
        const provinceResponse = await axios.get('https://provinces.open-api.vn/api/p/');
        cache.provinces = provinceResponse.data || [];
      }
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
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const profileRes = await profileService.getProfile({
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });

      if (profileRes.success && profileRes.data?.account) {
        const account = profileRes.data.account;
        setProfileData(account);
        setFormData({
          fullName: account.fullName || '',
          email: account.email || '',
          phoneNumber: account.phoneNumber || '',
          dob: formatDateToYYYYMMDD(account.dob) || '',
          gender: account.gender || '',
          imageBase64: account.imageBase64 || '',
          password: '',
          roleId: account.roleId || 0,
          gameTicketCount: account.gameTicketCount || 0,
        });
        await fetchAddresses();
      } else {
        if (profileRes.message.includes('hết hạn') || profileRes.message.includes('token')) {
          await handleUnauthorized(profileRes.message);
        } else {
          setNotification({ message: profileRes.message || 'Không thể tải hồ sơ.', type: 'error' });
        }
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
      setNotification({ message: 'Không thể tải thông tin người dùng.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        setNotification({ message: 'Bạn cần cho phép truy cập thư viện ảnh.', type: 'error' });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const base64Image = result.assets[0].base64;
        setFormData((prev) => ({ ...prev, imageBase64: base64Image }));
        setImageError(false);
        setNotification({ message: 'Tải ảnh lên thành công!', type: 'success' });
      }
    } catch (error) {
      console.error('Image pick error:', error);
      setNotification({ message: 'Tải ảnh lên thất bại.', type: 'error' });
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        dob: formData.dob,
        gender: formData.gender,
        imageBase64: formData.imageBase64 || undefined,
        password: formData.password || undefined,
        roleId: formData.roleId,
        gameTicketCount: formData.gameTicketCount,
      };

      const updateRes = await profileService.updateAccount(profileData._id, payload);

      if (updateRes.success) {
        setNotification({ message: 'Cập nhật hồ sơ thành công!', type: 'success' });
        await fetchProfile();
        setIsEditing(false);
        setFormData((prev) => ({
          ...prev,
          password: '',
          imageBase64: updateRes.data.account?.imageBase64 || formData.imageBase64,
        }));
      } else {
        if (updateRes.message.includes('hết hạn') || updateRes.message.includes('token')) {
          await handleUnauthorized(updateRes.message);
        } else {
          setNotification({ message: updateRes.message || 'Cập nhật hồ sơ thất bại.', type: 'error' });
        }
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setNotification({ message: 'Cập nhật hồ sơ thất bại.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await AsyncStorage.removeItem('userToken');
            dispatch(logout());
            navigation.replace('Login');
          } catch (error) {
            console.error('Logout error:', error);
            setNotification({ message: 'Đăng xuất thất bại.', type: 'error' });
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleDateChange = useCallback((event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFormData({ ...formData, dob: formattedDate });
    }
  }, [formData]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  useEffect(() => {
    if (user) {
      fetchProvinces().then(() => fetchProfile());
    } else {
      handleUnauthorized('Vui lòng đăng nhập để xem thông tin.');
    }

    
    const unsubscribe = navigation.addListener('focus', () => {
      if (user) {
        fetchAddresses(); 
      }
    });

    return () => unsubscribe;
  }, [user, navigation]);

  if (!user) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.loginPrompt}>Vui lòng đăng nhập để xem thông tin.</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginButton}>
          <Text style={styles.loginText}>Đăng nhập</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (loading && !profileData) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#FF69B4" />
        <Text style={styles.loginPrompt}>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  if (!profileData) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.loginPrompt}>Không thể tải thông tin. Vui lòng thử lại.</Text>
        <TouchableOpacity onPress={fetchProfile} style={styles.resetButton}>
          <Text style={styles.resetText}>Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const defaultAddress = addresses.find((address) => address.isDefault);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Notification
          message={notification?.message}
          type={notification?.type}
          onDismiss={() => setNotification(null)}
        />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>
          <View style={styles.imageContainer}>
            <Image
              source={
                imageError || !formData.imageBase64
                  ? require('../../../assets/DesikiCare.jpg')
                  : { uri: `data:image/jpeg;base64,${formData.imageBase64}` }
              }
              style={styles.profileImage}
              onError={handleImageError}
            />
            {isEditing && (
              <TouchableOpacity style={styles.uploadButton} onPress={handleImagePick}>
                <Text style={styles.uploadButtonText}>Tải ảnh lên</Text>
              </TouchableOpacity>
            )}
            <View style={styles.infoContainer}>
              <Text style={styles.label}>Địa chỉ giao hàng </Text>
              {defaultAddress ? (
                <View style={styles.addressContainer}>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Tên: </Text>
                    {defaultAddress.receiverName} - <Text style={styles.infoLabel}>SĐT: </Text>
                    {defaultAddress.receiverPhone}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Địa chỉ: </Text>
                    {defaultAddress.addressDetailDescription}, {defaultAddress.wardName},{' '}
                    {defaultAddress.districtName}, {defaultAddress.provinceName}
                  </Text>
                  
                </View>
              ) : (
                <Text style={styles.infoText}>Chưa có địa chỉ mặc định. Vui lòng thêm địa chỉ.</Text>
              )}
            </View>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Họ và tên</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.fullName}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                placeholder="Nhập họ và tên"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.infoText}>{profileData.fullName || 'Chưa cập nhật'}</Text>
            )}
            <Text style={styles.label}>Email</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="Nhập email"
                keyboardType="email-address"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.infoText}>{profileData.email || 'Chưa cập nhật'}</Text>
            )}
            <Text style={styles.label}>Số điện thoại</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.infoText}>{profileData.phoneNumber || 'Chưa cập nhật'}</Text>
            )}
            <Text style={styles.label}>Ngày sinh</Text>
            {isEditing ? (
              <>
                <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.infoText}>
                    {formData.dob ? formatDateToDDMMYYYY(formData.dob) : 'Chọn ngày sinh'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  Platform.OS === 'android' ? (
                    <DateTimePicker
                      value={formData.dob ? new Date(formData.dob) : new Date()}
                      mode="date"
                      display="default"
                      maximumDate={new Date()}
                      onChange={handleDateChange}
                    />
                  ) : (
                    <View style={styles.datePickerModal}>
                      <DateTimePicker
                        value={formData.dob ? new Date(formData.dob) : new Date()}
                        mode="date"
                        display="spinner"
                        maximumDate={new Date()}
                        onChange={handleDateChange}
                      />
                      <TouchableOpacity
                        style={styles.doneButton}
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Text style={styles.doneButtonText}>Xong</Text>
                      </TouchableOpacity>
                    </View>
                  )
                )}
              </>
            ) : (
              <Text style={styles.infoText}>
                {profileData.dob ? formatDateToDDMMYYYY(profileData.dob) : 'Chưa cập nhật'}
              </Text>
            )}
            <Text style={styles.label}>Giới tính</Text>
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowGenderOptions(true)}
                >
                  <Text style={styles.infoText}>
                    {formData.gender ? formData.gender : 'Chọn giới tính'}
                  </Text>
                </TouchableOpacity>
                {showGenderOptions && (
                  <View style={styles.optionBox}>
                    {['Nam', 'Nữ', 'Khác'].map((option) => (
                      <TouchableOpacity
                        key={option}
                        onPress={() => {
                          setFormData({ ...formData, gender: option });
                          setShowGenderOptions(false);
                        }}
                        style={styles.optionItem}
                      >
                        <Text style={styles.optionText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.infoText}>{profileData.gender || 'Chưa cập nhật'}</Text>
            )}
            <Text style={styles.label}>Mật khẩu mới</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                placeholder="Nhập mật khẩu mới (nếu muốn thay đổi)"
                secureTextEntry
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.infoText}>********</Text>
            )}
            <Text style={styles.label}>Điểm tích lũy</Text>
            <Text style={styles.infoText}>{profileData.points || 0}</Text>
            <Text style={styles.label}>Số vé trò chơi</Text>
            <Text style={styles.infoText}>{profileData.gameTicketCount || 0}</Text>
            <Text style={styles.label}>Trạng thái tài khoản</Text>
            <Text style={styles.infoText}>
              {profileData.isDeactivated ? 'Đã bị vô hiệu hóa' : 'Hoạt động'}
            </Text>
          </View>
          {isEditing ? (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleUpdateProfile}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsEditing(false)}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setIsEditing(true)}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Chỉnh sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('DeliveryAddress', { accountId: profileData._id })}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Quản lý địa chỉ giao hàng</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View >
          <Text style={styles.sectionTitle1}>Version 2.4.7</Text>
          <Text style={styles.infoText1}>Ứng dụng DesikiCare</Text>
          <Text style={styles.infoText1}>© 2025 DesikiCare. All rights reserved.</Text>
   
          </View>
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;