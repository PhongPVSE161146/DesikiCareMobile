import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TextInput, StyleSheet, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/Home/HomeScreen';
import ProductDetailScreen from '../screens/Product/ProductDetailScreen';
import CategoryScreen from '../screens/Category/CategoryScreen';
import CartScreen from '../screens/Cart/CartScreen';
import CheckoutScreen from '../screens/Cart/CheckoutScreen';
import NotificationScreen from '../screens/Notification/NotificationScreen';
import AccountScreen from '../screens/Profile/AccountScreen';
import LoginScreen from '../screens/Auth/Login/LoginScreen';
import RegisterScreen from '../screens/Auth/Register/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPassword/ForgotPasswordScreen';
import NewProductsScreen from '../screens/Home/FeatureButton/NewProductsScreen';
import MiniGameScreen from '../screens/Home/FeatureButton/MiniGameScreen';
import GuideScreen from '../screens/Home/FeatureButton/GuideScreen';
import DealsScreen from '../screens/Home/FeatureButton/DealsScreen';
import SupportScreen from '../screens/Home/FeatureButton/SupportScreen';
import GoldenHourScreen from '../screens/Home/FeatureButton/GoldenHourScreen';
import PolicyScreen from '../screens/Home/FeatureButton/PolicyScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import Payment from '../screens/Payments/payment';
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Stack Navigator for Home and sub-screens
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

// Stack Navigator for Cart and Checkout
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

// Bottom Tabs Navigator
function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>

      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#fff',
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom,
            borderTopWidth: 0,
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Category') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Cart') {
              iconName = focused ? 'cart' : 'cart-outline';
            } else if (route.name === 'Notification') {
              iconName = focused ? 'notifications' : 'notifications-outline';
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
        <Tab.Screen name="Cart" component={CartStack} options={{ title: 'Giỏ hàng' }} />
        <Tab.Screen
          name="Notification"
          component={NotificationScreen}
          options={{ title: 'Thông báo' }}
        />
        <Tab.Screen name="Account" component={AccountScreen} options={{ title: 'Tài khoản' }} />

      </Tab.Navigator>
    </SafeAreaView>
  );
}

// Main Navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="NewProductsScreen" component={NewProductsScreen} />
        <Stack.Screen name="MiniGameScreen" component={MiniGameScreen} />
        <Stack.Screen name="GuideScreen" component={GuideScreen} />
        <Stack.Screen name="DealsScreen" component={DealsScreen} />
        <Stack.Screen name="SupportScreen" component={SupportScreen} />
        <Stack.Screen name="GoldenHourScreen" component={GoldenHourScreen} />
        <Stack.Screen name="PolicyScreen" component={PolicyScreen} />
        {/* <Stack.Screen name="Payment" component={Payment} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2ecc71',
    padding: 10,
    height: 60,
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 10,
    color: '#000',
    marginRight: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});

export default AppNavigator;