import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import ProductList from '../../components/ProductList';
import FeatureButton from '../../components/FeatureButton';
import FlashSale from '../../components/FlashSale';
import ListItem from '../../components/ListItem';
import { MaterialIcons } from '@expo/vector-icons';
import CustomHeader from '../../components/Header/CustomHeader';
import Notification from '../../components/Notification'; // <- Thêm cái này

const features = [
  { title: 'Danh Mục', icon: <MaterialIcons name="menu" size={32} color="#555" /> },
  { title: 'Mini Game', icon: <MaterialIcons name="gamepad" size={32} color="#4CAF50" /> },
  { title: 'Hỗ Trợ', icon: <MaterialIcons name="support-agent" size={32} color="#9C27B0" /> },
  { title: 'Chính Sách', icon: <MaterialIcons name="policy" size={32} color="#795548" /> },
];

const HomeScreen = ({ navigation, route }) => {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (route.params?.notification) {
      setNotification(route.params.notification);
    }
  }, [route.params]);

  const handlePress = (title) => {
    switch (title) {
      case 'Danh Mục':
        navigation.navigate('Category');
        break;
      case 'Mini Game':
        navigation.navigate('MiniGameScreen');
        break;
      case 'Hỗ Trợ':
        navigation.navigate('SupportScreen');
        break;
      case 'Chính Sách':
        navigation.navigate('PolicyScreen');
        break;
    }
  };

  const renderHeader = () => (
    <View>
      <Notification
        message={notification?.message}
        type={notification?.type}
        onDismiss={() => setNotification(null)}
      />
      <View style={styles.featureContainer}>
        {features.map((feature, index) => (
          <FeatureButton
            key={`feature-${index}`}
            title={feature.title}
            icon={feature.icon}
            onPress={() => handlePress(feature.title)}
          />
        ))}
      </View>
      <FlashSale />
      <ListItem />
    </View>
  );

  return (
    <View style={styles.container}>
      {notification && (
  <Notification
    message={notification.message}
    type={notification.type}
    onDismiss={() => setNotification(null)}
  />
)}

      <CustomHeader />
      <FlatList
        ListHeaderComponent={renderHeader}
        data={[]}
        renderItem={() => null}
        keyExtractor={() => 'dummy'}
        contentContainerStyle={styles.scrollContainer}
        ListFooterComponent={<ProductList navigation={navigation} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  featureContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#fa7ca6',
  },
});

export default HomeScreen;
