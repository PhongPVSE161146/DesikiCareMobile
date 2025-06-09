import React from 'react';
import { View, Text, Button } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/authSlice';
import { styles } from '../../assets/styles';

const AccountScreen = ({ navigation }) => {
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tài khoản</Text>
      {user ? (
        <>
          <Text>Email: {user.email}</Text>
          <Text>Tên: {user.name || 'Khách'}</Text>
          <Button
            title="Đăng xuất"
            onPress={() => {
              dispatch(logout());
              navigation.navigate('Login');
            }}
          />
        </>
      ) : (
        <Button
          title="Đăng nhập"
          onPress={() => navigation.navigate('Login')}
        />
      )}
    </View>
  );
};

export default AccountScreen;