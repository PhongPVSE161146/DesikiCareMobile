import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native'; // ✅ Đã thêm Platform
import Ionicons from 'react-native-vector-icons/Ionicons';
import { enableScreens } from 'react-native-screens';

import HomeScreen from '../screens/Home/HomeScreen';
import ProductDetailScreen from '../screens/Product/ProductDetailScreen';
import CategoryScreen from '../screens/Category/CategoryScreen';
import CartScreen from '../screens/Cart/CartScreen';
import CheckoutScreen from '../screens/Cart/CheckoutScreen';
import OrderHistory from '../screens/History/OrderHistory';
import AccountScreen from '../screens/Profile/AccountScreen';
import LoginScreen from '../screens/Auth/Login/LoginScreen';
import RegisterScreen from '../screens/Auth/Register/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPassword/ForgotPasswordScreen';
import MiniGameScreen from '../screens/Home/FeatureButton/MiniGameScreen';
import SupportScreen from '../screens/Home/FeatureButton/SupportScreen';
import PolicyScreen from '../screens/Home/FeatureButton/PolicyScreen';
import Payment from '../screens/Payments/Payment';
import ConfirmPaymentScreen from '../screens/Payments/ConfirmPaymentScreen';

enableScreens(false);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}

function CartStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CartMain" component={CartScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          height: 70,
          borderTopWidth: 0,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Category':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'Cart':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'PaidOrderHistory':
              iconName = focused ? 'document-text' : 'document-text-outline';
              break;
            case 'Account':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          if (focused) {
            return (
              <View
                style={{
                  backgroundColor: '#ffe6ec',
                  padding: 10,
                  borderRadius: 30,
                  marginBottom: 20,
                  zIndex: 99,
                  ...Platform.select({
                    ios: {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 3,
                    },
                    android: {
                      elevation: 5,
                    },
                  }),
                }}
              >
                <Ionicons name={iconName} size={26} color="#ff4d4f" />
              </View>
            );
          }

          return <Ionicons name={iconName} size={24} color="gray" />;
        },
        tabBarActiveTintColor: '#ff4d4f',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ title: 'Trang chủ' }} />
      <Tab.Screen name="Category" component={CategoryScreen} options={{ title: 'Danh mục' }} />
      <Tab.Screen
        name="Cart"
        component={CartStack}
        options={{
          title: 'Giỏ hàng',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#fa7ca6',
          },
          headerTintColor: '#fff',
        }}
      />
      <Tab.Screen
        name="PaidOrderHistory"
        component={OrderHistory}
        options={{
          title: 'Lịch Sử Đơn Hàng',
          headerShown: true,
          headerStyle: {
            backgroundColor: 'red',
          },
          headerTintColor: '#fff',
        }}
      />
      <Tab.Screen name="Account" component={AccountScreen} options={{ title: 'Tài khoản' }} />
    </Tab.Navigator>
  );
}

const AppNavigator = () => {
  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="MiniGameScreen" component={MiniGameScreen} />
          <Stack.Screen name="SupportScreen" component={SupportScreen} />
          <Stack.Screen name="PolicyScreen" component={PolicyScreen} />
          <Stack.Screen
            name="Payment"
            component={Payment}
            options={{
              headerShown: true,
              title: 'Thanh toán',
              headerStyle: { backgroundColor: '#fa7ca6' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          />
          <Stack.Screen name="ConfirmPayment" component={ConfirmPaymentScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AppNavigator;
