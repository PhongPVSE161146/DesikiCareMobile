import React from 'react';
import { View, TextInput, StyleSheet, Image, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Logo (replace with your actual logo source)
const logo = require('../../../assets/DesikiCare.jpg'); // Update the path to your logo image

// Custom Scan Icon with Barcode
const CustomScanIcon = () => {
  return (
    <View style={styles.scanContainer}>
      <View style={styles.barcodeLines}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={styles.line} />
        ))}
      </View>
      <Ionicons name="scan-outline" size={24} color="#fff" style={styles.scanIcon} />
    </View>
  );
};

const CustomHeader = () => {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={[styles.header, { paddingTop: insets.top}]}>
      <View style={styles.headerContent}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchBar}
            placeholder="Tìm kiếm"
            placeholderTextColor="#ccc"
          />
        </View>
        <View style={styles.iconContainer}>
          <CustomScanIcon />
          <Ionicons name="location-outline" size={24} color="#fff" style={styles.iconSpacing} />
          <Ionicons name="cube-outline" size={24} color="#fff" />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fa7ca6',
    paddingHorizontal: 5,
    paddingBottom: 15,
 paddingTop: 10, // Dynamic padding based on safe area insets
    // Removed fixed height to allow dynamic sizing
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Ensure even spacing
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 10,
  },
  searchIcon: {
    paddingHorizontal: 10,
  },
  searchBar: {
    flex: 1,
    paddingVertical: 8, // Reduced padding for better fit
    color: '#000',
    fontSize: 16,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSpacing: {
    marginHorizontal: 10, // Reduced spacing for better alignment
  },
  scanContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barcodeLines: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  line: {
    width: 2,
    height: 12,
    backgroundColor: '#fff',
    marginHorizontal: 1,
  },
  scanIcon: {
    position: 'absolute',
  },
});

export default CustomHeader;