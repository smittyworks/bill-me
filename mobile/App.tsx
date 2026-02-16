import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import BillsListScreen from './screens/BillsListScreen';
import CameraScreen from './screens/CameraScreen';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env file');
}

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return await SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (isSignedIn) {

    // App navigation
    const appNavigation = {
      navigate: (screen: string) => {
        if (screen === 'Camera') setShowCamera(true);
      },
      goBack: () => setShowCamera(false),
    };

    if (showCamera) {
      return (
        <CameraScreen
          navigation={appNavigation}
          onBillCreated={() => {
            setShowCamera(false);
            setRefreshKey(prev => prev + 1); // Trigger refresh
          }}
        />
      );
    }

    return <BillsListScreen key={refreshKey} navigation={appNavigation} />;
  }

  // Auth navigation
  const navigation = {
    navigate: (screen: string) => {
      if (screen === 'SignUp') setShowSignUp(true);
      if (screen === 'SignIn') setShowSignUp(false);
    }
  };

  if (showSignUp) {
    return <SignUpScreen navigation={navigation} />;
  }

  return <SignInScreen navigation={navigation} />;
}

export default function App() {
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <RootNavigator />
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
