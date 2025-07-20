import { StyleSheet } from 'react-native';


const COLORS = {
  primary: '#FF69B4', // Matches DeliveryAddressScreen's ActivityIndicator and Switch colors
  white: '#fff',
  gray: '#666',
  lightGray: '#ccc',
  darkGray: '#333',
  borderGray: '#eee',
  red: 'red',
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5', // Light pink background
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#FFC1CC', // Soft pink border
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#C71585', // Medium pink for title
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFB6C1', // Light pink border
    paddingBottom: 8,
    textAlign: 'center', // Center the title
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FFB6C1', // Light pink border
    backgroundColor: '#FFF0F5', // Light pink fallback
  },
  uploadButton: {
    backgroundColor: '#FF69B4', // Hot pink for upload button
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#C71585', // Medium pink for labels
    marginTop: 12,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    color: '#4B0082', // Dark purple for contrast
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF0F5', // Light pink background
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFB6C1', // Light pink border
  },
  sectionTitle1: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary, // Use primary pink for emphasis
    textAlign: 'center',
    marginVertical: 8,
  },
infoText1: {
  fontSize: 16,
  color: COLORS.gray,
  textAlign: 'center',
  marginVertical: 4,
},
  input: {
    fontSize: 16,
    color: '#4B0082', // Dark purple text
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFC1CC', // Soft pink border
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  doneButton: {
  backgroundColor: '#FF69B4',
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 10,
  alignSelf: 'flex-end',
  marginTop: 10,
},

doneButtonText: {
  color: '#fff',
  fontWeight: 'bold',
},
  
  button: {
    flex: 1,
    backgroundColor: '#FF69B4', // Hot pink for buttons
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  saveButton: {
    backgroundColor: 'green', // Hot pink
  },
  cancelButton: {
    backgroundColor: '#DB7093', // Slightly darker pink for cancel
  },
  optionBox: {
  backgroundColor: '#fff',
  borderRadius: 8,
  elevation: 2,
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
  marginTop: 8,
},
optionItem: {
  padding: 10,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
},
optionText: {
  fontSize: 16,
  color: '#333',
},

  logoutButton: {
    backgroundColor: 'red', // Medium pink for logout
    margin: 16,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF0F5', // Light pink background
    padding: 16,
  },
  loginPrompt: {
    fontSize: 18,
    color: '#4B0082', // Dark purple for contrast
    marginBottom: 16,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#FF69B4', // Hot pink
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resetButton: {
    backgroundColor: '#FF69B4', // Hot pink
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  resetText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default styles;