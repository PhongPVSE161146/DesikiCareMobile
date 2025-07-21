import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, Linking, StyleSheet } from 'react-native';
import { fetchStoreLocations } from '../../config/axios/Home/Google/LocationService';

// Theme colors
const COLORS = {
  primary: '#fa7ca6',
  white: '#fff',
  gray: '#666',
  lightGray: '#ccc',
  darkGray: '#333',
  borderGray: '#eee',
};

const LocationModal = ({ visible, onClose, setNotification }) => {
  const [storeLocations, setStoreLocations] = useState([]);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const data = await fetchStoreLocations();
        setStoreLocations(data);
      } catch (error) {
        setNotification({
          message: 'Không thể tải danh sách cửa hàng. Vui lòng thử lại sau.',
          type: 'error',
        });
      }
    };
    if (visible) {
      loadLocations();
    }
  }, [visible]);

  const openGoogleMaps = (lat, lng, name) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(name)}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          setNotification({
            message: 'Không thể mở Google Maps. Vui lòng thử lại sau.',
            type: 'error',
          });
        }
      })
      .catch((err) => {
        console.error('Lỗi khi mở Google Maps:', err);
        setNotification({
          message: 'Không thể mở Google Maps. Vui lòng thử lại sau.',
          type: 'error',
        });
      });
  };

  const renderLocation = ({ item }) => (
    <TouchableOpacity
      onPress={() => openGoogleMaps(item.lat, item.lng, item.name)}
      style={styles.locationItem}
      accessibilityLabel={`Mở ${item.name} trên Google Maps`}
      accessibilityRole="button"
    >
      <Text style={styles.locationName}>{item.name}</Text>
      <Text style={styles.locationAddress}>{item.address}</Text>
      <Text style={styles.locationPhone}>SĐT: {item.phone}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Địa Chỉ Cửa Hàng</Text>
          <FlatList
            data={storeLocations}
            renderItem={renderLocation}
            keyExtractor={(item) => item.id}
            style={styles.locationList}
            contentContainerStyle={styles.listContent}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
          />
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityLabel="Đóng danh sách cửa hàng"
            accessibilityRole="button"
          >
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    width: '92%',
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    color: COLORS.darkGray,
  },
  locationList: {
    flexGrow: 0,
  },
  listContent: {
    paddingBottom: 8,
  },
  locationItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  locationAddress: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  locationPhone: {
    fontSize: 12,
    color: COLORS.lightGray,
    marginTop: 4,
  },
  closeButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LocationModal;