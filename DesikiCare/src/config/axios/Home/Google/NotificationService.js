export const fetchNotifications = async () => {
  try {
    // Replace with your actual API endpoint
    const response = await fetch('https://api.example.com/notifications', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers if needed
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    const data = await response.json();
    // Assuming the API returns data in the format: { id, title, message, time }
    return data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};