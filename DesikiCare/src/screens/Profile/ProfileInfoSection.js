import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import dayjs from 'dayjs';
import profileService from '../../config/axios/Home/AccountProfile/profileService';
import styles from './styles';

const ProfileInfoSection = ({
  profileData,
  setProfileData,
  fetchProfile,
  setNotification,
  handleUnauthorized,
  loading,
  setLoading,
}) => {
  const [fullName, setFullName] = useState(profileData?.account?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(profileData?.account?.phoneNumber || '');
  const [gender, setGender] = useState(profileData?.account?.gender || '');
  const [dob, setDob] = useState(profileData?.account?.dob ? dayjs(profileData.account.dob).toDate() : null);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [avatarBase64, setAvatarBase64] = useState('');
  const [previewAvatar, setPreviewAvatar] = useState(profileData?.account?.imageUrl || '');
  const [errors, setErrors] = useState({ fullName: '', phoneNumber: '', gender: '', dob: '' });

  // Format date
  const formatDate = (date) => (date ? dayjs(date).format('DD-MM-YYYY') : '');

  // Validate date
  const isValidDate = (dateStr) => {
    if (!dateStr) return false;
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

    setErrors(newErrors);
    if (!isValid) {
      setNotification({ message: 'Vui lòng kiểm tra lại thông tin.', type: 'error' });
    }
    return isValid;
  };

  // Upload avatar
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
        ...(avatarBase64 && { imageBase64: avatarBase64 }),
      };
      const res = await profileService.updateAccount(payload, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });
      if (res.success) {
        setNotification({ message: 'Cập nhật thông tin thành công!', type: 'success' });
        await fetchProfile();
      } else {
        if (res.message.includes('hết hạn') || res.message.includes('token')) {
          await handleUnauthorized(res.message);
        } else {
          setNotification({ message: res.message || 'Cập nhật thất bại.', type: 'error' });
        }
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setNotification({ message: 'Cập nhật thất bại.', type: 'error' });
    }
    setLoading(false);
  };

  return (
    <View style={styles.section}>
      <View style={styles.headerSection}>
        <TouchableOpacity onPress={handleUploadAvatar} accessible={true} accessibilityLabel="Chọn ảnh đại diện">
          <Image
            source={{ uri: previewAvatar || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <Text style={styles.username}>{fullName || 'Khách hàng'}</Text>
        <Text style={styles.emailText}>{profileData?.account?.email}</Text>
        <Text style={styles.points}>Điểm: {profileData?.account?.points || 0}</Text>
      </View>
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
          keyboardType="phone-pad"
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
          <Picker.Item label="Nam" value="male" />
          <Picker.Item label="Nữ" value="female" />
          <Picker.Item label="Khác" value="other" />
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
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleUpdate}
        disabled={loading}
        accessible={true}
        accessibilityLabel="Cập nhật thông tin cá nhân"
      >
        <Text style={styles.buttonText}>Cập nhật</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileInfoSection;