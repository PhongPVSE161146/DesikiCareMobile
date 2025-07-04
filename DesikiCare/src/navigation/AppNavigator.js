import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native'; // Thay SafeAreaView bằng View
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
// import NewProductsScreen from '../screens/Home/FeatureButton/NewProductsScreen';
import MiniGameScreen from '../screens/Home/FeatureButton/MiniGameScreen';
// import GuideScreen from '../screens/Home/FeatureButton/GuideScreen';
// import DealsScreen from '../screens/Home/FeatureButton/DealsScreen';
import SupportScreen from '../screens/Home/FeatureButton/SupportScreen';
// import GoldenHourScreen from '../screens/Home/FeatureButton/GoldenHourScreen';
import PolicyScreen from '../screens/Home/FeatureButton/PolicyScreen';
import Payment from '../screens/Payments/Payment';
import ConfirmPaymentScreen from '../screens/Payments/ConfirmPaymentScreen';

// Vô hiệu hóa react-native-screens để tránh lỗi NativeEventEmitter
enableScreens(false);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}

function CartStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CartMain"
        component={CartScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
     
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        backgroundColor: '#fa7ca6',
  
        tabBarStyle: {
          backgroundColor: '#fff',
          height: 70,
          borderTopWidth: 0,
          paddingBottom: 20,
          paddingTop: 5,
          marginBottom: 0,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Category') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
       } else if (route.name === 'PaidOrderHistory') {
    iconName = focused ? 'document-text' : 'document-text-outline'; // Thay thế nếu dùng Ionicons
          } else if (route.name === 'Account') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
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
      backgroundColor: '#fa7ca6', // màu hồng
    },
    headerTintColor: '#fff', // màu chữ trắng cho dễ đọc
  }}
/>

      <Tab.Screen
        name="PaidOrderHistory"
        component={OrderHistory}
        options={{ title: 'Lịch Sử Đơn Hàng', headerShown: true ,

        headerStyle: {
      backgroundColor: 'red', // màu hồng
    },
    headerTintColor: '#fff', // màu chữ trắng cho dễ đọc
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
          {/* <Stack.Screen name="NewProductsScreen" component={NewProductsScreen} /> */}
          <Stack.Screen name="MiniGameScreen" component={MiniGameScreen} />
          {/* <Stack.Screen name="GuideScreen" component={GuideScreen} /> */}
          {/* <Stack.Screen name="DealsScreen" component={DealsScreen} /> */}
          <Stack.Screen name="SupportScreen" component={SupportScreen} />
          {/* <Stack.Screen name="GoldenHourScreen" component={GoldenHourScreen} /> */}
          <Stack.Screen name="PolicyScreen" component={PolicyScreen} />
           <Stack.Screen name="Payment" component={Payment} options={{
            headerShown: true,
            title: 'Thanh toán',
            headerStyle: { backgroundColor: '#fa7ca6' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
           }} />
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