import {
  View,
  Alert,
  BackHandler,
  PermissionsAndroid,
  Platform,
  Linking,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import WebView from 'react-native-webview';
import NetInfo from '@react-native-community/netinfo';
import Geolocation from 'react-native-geolocation-service';
import SplashScreen from 'react-native-splash-screen';

const App = () => {
  const url = 'https://demo2.geoagrodigital.org/mobile511';
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);

  // Hide splash screen
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current?.goBack();
          return true;
        }
        Alert.alert('Exit App', 'Do you want to exit?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      }
    );

    return () => backHandler.remove();
  }, [canGoBack]);

  // Check internet connection
  const checkInternet = () => {
    NetInfo.fetch().then((state) => {
      if (!state.isConnected) {
        Alert.alert(
          'No Internet Connection',
          'Please enable mobile data or Wi-Fi.',
          [
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }
    });
  };

  // Request location permission and fetch current location
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to function properly.',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission granted');
          getCurrentLocation();
        } else {
          Alert.alert('Permission Denied', 'Location permission is required.');
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      getCurrentLocation(); // iOS handles permissions differently
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        console.log('Location:', position.coords);
      },
      (error) => {
        console.warn(error);
        if (error.code === 2) {
          Alert.alert(
            'Enable Location',
            'Please enable location services.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  useEffect(() => {
    requestLocationPermission();
    checkInternet();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webViewRef}
        style={{ flex: 1 }}
        source={{ uri: url }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
        }}
      />
    </View>
  );
};

export default App;