import React, { useState } from 'react';
import { View, Image, Dimensions, StyleSheet, Text } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

const { width } = Dimensions.get('window');

// Calculate responsive height (e.g., 9:16 aspect ratio for most images)
const CAROUSEL_HEIGHT = width * 0.6; // 60% of screen width for balanced height

// Array of banner images (using provided URIs)
const banners = [
  { uri: 'https://juro.com.vn/wp-content/uploads/cach-chup-anh-my-pham-dep.jpg' },
  { uri: 'https://juro.com.vn/wp-content/uploads/chup-anh-my-pham-600x400.jpg' },
  { uri: 'https://juro.com.vn/wp-content/uploads/chup-my-pham.jpg' },
  { uri: 'https://juro.com.vn/wp-content/uploads/cach-chup-anh-my-pham-dep.jpg' },

];

const PromoCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={styles.container}>
      <Carousel
        width={width * 0.9} // 90% of screen width for padding
        height={CAROUSEL_HEIGHT}
        autoPlay={true}
        data={banners}
        scrollAnimationDuration={800} // Slightly faster for smoother feel
        autoPlayInterval={4000} // Longer interval for better user engagement
        loop={true}
        onSnapToItem={(index) => setActiveIndex(index)} // Track active slide
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image
              source={item}
              style={styles.image}
              resizeMode="contain" // Changed to contain for better image scaling
              onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
            />
            <View style={styles.overlay} />
          </View>
        )}
      />
      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { opacity: index === activeIndex ? 1 : 0.4 },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 15, // Slightly increased for better spacing
    paddingHorizontal: 10,
    backgroundColor: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)', // Gradient background for a modern look
  },
  slide: {
    width: width * 0.9,
    height: CAROUSEL_HEIGHT,
    borderRadius: 20, // Softer, more modern corners
    overflow: 'hidden',
    backgroundColor: '#1a1a1a', // Darker fallback for a premium feel
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 20, // Match slide borderRadius
    transform: [{ scale: 1.02 }], // Slight zoom effect for depth
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4))', // Gradient overlay for sophistication
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  dot: {
    width: 10, // Slightly larger dots
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff', // White dots for contrast
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#6200ea', // Accent color border
    opacity: 0.4,
    transform: [{ scale: 1 }], // Base scale for animation
    transition: 'all 0.3s ease', // Smooth transition for active dot
  },
  // Active dot style (applied dynamically)
  activeDot: {
    opacity: 1,
    backgroundColor: '#6200ea', // Vibrant purple for active dot
    transform: [{ scale: 1.2 }], // Slightly larger for emphasis
  },
});

export default PromoCarousel;