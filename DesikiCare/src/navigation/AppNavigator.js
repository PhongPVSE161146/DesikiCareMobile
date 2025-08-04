
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { HeaderBackButton } from '@react-navigation/elements';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
// import { enableScreens } from 'react-native-screens';
import GameEventDetailScreen from '../screens/Game/GameEventDetailScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import ProductDetailScreen from '../screens/Product/ProductDetailScreen';
import CategoryScreen from '../screens/Category/CategoryScreen';
import CartScreen from '../screens/Cart/CartScreen';
import DeliveryAddressScreen from '../screens/Profile/DeliveryAddressScreen';
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
import QRPaymentScreen from '../screens/Payments/QRPaymentScreen';
import GameEventsScreen from '../screens/Game/GameEventsScreen';
import RewardsScreen from '../screens/Game/RewardsScreen';
import QuizScreen from '../screens/Home/QuizScreen';
// enableScreens(true); // Enable native screens for better performance
//Game import
// import GameEventDetailScreen from '../screens/Game/GameEventDetailScreen';
// import FillBlankGame from '../screens/Game/FillBlankGame';
import SpinWheelGame from '../screens/Game/SpinWheelGame';
import ScratchCardGame from '../screens/Game/ScratchCardGame';
import MatchPairGame from '../screens/Game/MatchPairGame';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      
    </Stack.Navigator>
  );
}

function CartStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CartMain" component={CartScreen} options={{ headerShown: false }} />
     
    </Stack.Navigator>
  );
}

function MiniGame() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: '#fff' },
        tabBarActiveTintColor: '#6200EE',
        tabBarInactiveTintColor: '#757575',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="MiniGameTabs"
        component={MiniGameScreen}
        options={{
          tabBarLabel: 'Mini Game',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="game-controller-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name=" GameEvents"
        component={GameEventsScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Sự kiện',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={RewardsScreen}
        options={{
          tabBarLabel: 'Lịch sử điểm',
        
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Data loading functions (replace with your actual data fetching logic)
const loadHomeData = async () => {
  console.log('Loading Home data...');
  // Example: const response = await fetch('https://api.example.com/home');
  // Update state or context with fetched data
};

const loadCategoryData = async () => {
  console.log('Loading Category data...');
  // Example: const response = await fetch('https://api.example.com/categories');
  // Update state or context
};

const loadCartData = async () => {
  console.log('Loading Cart data...');
  // Example: const response = await fetch('https://api.example.com/cart');
  // Update state or context
};

const loadPaidOrderHistoryData = async () => {
  console.log('Loading Paid Order History data...');
  // Example: const response = await fetch('https://api.example.com/order-history');
  // Update state or context
};

const loadAccountData = async () => {
  console.log('Loading Account data...');
  // Example: const response = await fetch('https://api.example.com/account');
  // Update state or context
};

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
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
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
                  padding: 2,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...Platform.select({
                    ios: {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                    },
                    android: {
                      elevation: 3,
                    },
                  }),
                }}
              >
                <Ionicons name={iconName} size={24} color="#ff4d4f" />
              </View>
            );
          }

          return <Ionicons name={iconName} size={24} color="gray" />;
        },
        tabBarActiveTintColor: '#ff4d4f',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ title: 'Trang chủ' }}
        listeners={{
          tabPress: () => {
            loadHomeData();
          },
        }}
      />
      <Tab.Screen
        name="Category"
        component={CategoryScreen}
        options={{ title: 'Danh mục' }}
        listeners={{
          tabPress: () => {
            loadCategoryData();
          },
        }}
      />
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
        listeners={{
          tabPress: () => {
            loadCartData();
          },
        }}
      />
      <Tab.Screen
        name="PaidOrderHistory"
        component={OrderHistory}
        options={{
          title: 'Đơn Hàng',
          headerShown: true,
          headerStyle: {
            backgroundColor: 'red',
          },
          headerTintColor: '#fff',
        }}
        listeners={{
          tabPress: () => {
            loadPaidOrderHistoryData();
          },
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{ title: 'Tài khoản' }}
        listeners={{
          tabPress: () => {
            loadAccountData();
          },
        }}
      />
    </Tab.Navigator>
  );
}

const AppNavigator = () => {
  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
  name="ProductDetail"
  component={ProductDetailScreen}
  options={({ navigation }) => ({
    headerShown: true,
    title: 'Chi tiết sản phẩm',
    headerStyle: { backgroundColor: '#5dd36dff' },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: 'bold' },
    headerLeft: () => (
      <HeaderBackButton
        onPress={() => navigation.goBack()}
        tintColor="#fff"
      />
    ),
  })}
/>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="MiniGameTabs" component={MiniGame} />
          <Stack.Screen name="SupportScreen" component={SupportScreen} />
          <Stack.Screen name="PolicyScreen" component={PolicyScreen} />
          <Stack.Screen name="SpinWheelGame" component={SpinWheelGame}
           options={{
              headerShown: true,
              title: 'Vòng quay may',
              headerStyle: { backgroundColor: '#5dd36dff' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
            />
         <Stack.Screen name="ScratchCardGame" component={ScratchCardGame}
           options={{
              headerShown: true,
              title: 'Cào thẻ',
              headerStyle: { backgroundColor: '#5dd36dff' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
            />
          <Stack.Screen name="MatchPairGame" component={MatchPairGame}
           options={{
              headerShown: true,
              title: 'Nối cặp',
              headerStyle: { backgroundColor: '#5dd36dff' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
            />
     
          <Stack.Screen name="GameEventDetail" component={GameEventDetailScreen}
            options={{
              headerShown: true,
              title: 'Chi tiết sự kiện',
              headerStyle: { backgroundColor: '#5dd36dff' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
           />
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
          <Stack.Screen name="ConfirmPaymentScreen" component={ConfirmPaymentScreen} />
          <Stack.Screen
            name="QRPaymentScreen"
            component={QRPaymentScreen}
            options={{
              headerShown: true,
              title: 'Thanh toán QR',
              headerStyle: { backgroundColor: '#fa7ca6' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          />
     <Stack.Screen
  name="DeliveryAddress"
  component={DeliveryAddressScreen}
  options={({ navigation }) => ({
    headerShown: true,
    title: 'Địa chỉ giao hàng',
    headerStyle: { backgroundColor: '#fa7ca6' },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: 'bold' },
    headerLeft: () => (
      <HeaderBackButton
        onPress={() => navigation.goBack()}
        tintColor="#fff"
      />
    ),
  })}
/>
  <Stack.Screen
          name="QuizScreen"
          component={QuizScreen}
           options={({ navigation }) => ({
    headerShown: true,
    title: 'Quiz',
    headerStyle: { backgroundColor: '#fa7ca6' },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: 'bold' },
    headerLeft: () => (
      <HeaderBackButton
        onPress={() => navigation.goBack()}
        tintColor="#fff"
      />
    ),
  })}
        />
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
