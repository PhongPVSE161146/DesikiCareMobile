import React from 'react';
import { View, TextInput, StyleSheet, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

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
  return (
    <View style={styles.header}>
      <Image source={logo} style={styles.logo} />
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
        <Ionicons name="cart-outline" size={24} color="#fff" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2ecc71',
    padding: 10,
    height: 60,
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
  },
  searchIcon: {
    paddingHorizontal: 10,
  },
  searchBar: {
    flex: 1,
    paddingVertical: 10,
    color: '#000',
    fontSize: 16,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  iconSpacing: {
    marginHorizontal: 20,
  },
  scanContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#fff',
    borderStyle: 'solid',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
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
});

export default CustomHeader;