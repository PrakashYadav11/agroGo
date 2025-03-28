import {
  Alert,
  Linking,
  PermissionsAndroid,
  StyleSheet,
  View,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import WebView from 'react-native-webview';
import Geolocation from 'react-native-geolocation-service';
import SplashScreen from 'react-native-splash-screen';

export default function App() {
  const url = 'https://demo2.geoagrodigital.org/mobile511';
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isAppLoaded, setIsAppLoaded] = useState(false);

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to function properly.',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission granted');
        Geolocation.getCurrentPosition(
          position => console.log('Location:', position),
          error => {
            if (error.code === 2) {
              Alert.alert(
                'Enable Location Services',
                'Your device location is turned off. Please enable it to continue.',
                [
                  {text: 'Cancel', style: 'cancel'},
                  {text: 'Open Settings', onPress: () => Linking.openSettings()},
                ],
              );
            }
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      } else {
        console.log('Location permission denied');
        Alert.alert('Location Permission Denied', 'This app requires location access.');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    requestLocationPermission();

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButton,
    );

    return () => {
      backHandler.remove();
    };
  }, []);

  useEffect(() => {
    if (!isAppLoaded) {
      // ✅ Show splash screen only on app start
      setTimeout(() => {
        SplashScreen.hide();
        setIsAppLoaded(true); // ✅ Set flag so splash screen doesn't show again
      }, 2000);
    }
  }, [isAppLoaded]);

  const handleBackButton = () => {
    if (webViewRef.current) {
      webViewRef.current.goBack();
      return true; // Prevent default back action
    }
  
    Alert.alert(
      'Exit App',
      'Do you want to exit the app?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'OK', onPress: () => BackHandler.exitApp()},
      ],
      {cancelable: false},
    );
    return true;
  };
  
  return (
    <View style={{flex: 1}}>
      {/* {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )} */}

      <WebView
        style={{flex: 1}}
        ref={webViewRef}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        source={{uri: url}}
        onLoadStart={() => setLoading(true)}
        onLoad={() => setLoading(false)}
        onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
  },
});