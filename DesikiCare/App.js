import * as React from 'react';
import { Provider } from 'react-redux';
import { enableScreens } from 'react-native-screens';
import store from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';

enableScreens(true); // Enable native screens for better performance

export default function App() {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}