import React from 'react';
import { View, Image, Dimensions, StyleSheet } from 'react-native';
import Carousel from 'react-native-reanimated-carousel'; // Use this modern carousel

const { width } = Dimensions.get('window');

// Array of banner images (replace with your actual image paths)


const PromoCarousel = () => {
  return (
    <View style={styles.container}>
      <Carousel
        width={width}
        height={250}
        autoPlay={true}
        data={banners}
        scrollAnimationDuration={1000} // Smooth scroll duration in ms
        autoPlayInterval={3000} // Interval between slides in ms
        loop={true}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={item} style={styles.image} resizeMode="cover" />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  slide: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
});

export default PromoCarousel;