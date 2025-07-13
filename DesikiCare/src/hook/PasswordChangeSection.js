import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native'; // Thêm TouchableOpacity
import Icon from 'react-native-vector-icons/MaterialIcons';
import profileService from '../config/axios/Home/AccountProfile/profileService';
import styles from '../screens/Profile/styles';

const PasswordChangeSection = ({ setNotification, handleUnauthorized, loading, setLoading }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

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

    setErrors(newErrors);
    if (!isValid) {
      setNotification({ message: 'Vui lòng kiểm tra lại mật khẩu.', type: 'error' });
    }
    return isValid;
  };

  // Change password
  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;
    setLoading(true);
    try {
      const res = await profileService.changePassword(currentPassword, newPassword, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });
      if (res.success) {
        setNotification({ message: 'Đổi mật khẩu thành công!', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        if (res.message.includes('hết hạn') || res.message.includes('token')) {
          await handleUnauthorized(res.message);
        } else {
          setNotification({ message: res.message || 'Đổi mật khẩu thất bại.', type: 'error' });
        }
      }
    } catch (error) {
      console.error('Change password error:', error);
      setNotification({ message: 'Đổi mật khẩu thất bại.', type: 'error' });
    }
    setLoading(false);
  };

  return (
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
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleChangePassword}
        disabled={loading}
        accessible={true}
        accessibilityLabel="Đổi mật khẩu"
      >
        <Text style={styles.buttonText}>Đổi mật khẩu</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PasswordChangeSection;