export const fetchStoreLocations = async () => {
  try {
    // Replace with your actual API endpoint
    const response = await fetch('https://api.example.com/store-locations', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers if needed
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch store locations');
    }
    const data = await response.json();
    // Assuming the API returns data in the format: { id, name, address, phone, lat, lng }
    return data;
  } catch (error) {
    console.error('Error fetching store locations:', error);
    throw error;
  }
};