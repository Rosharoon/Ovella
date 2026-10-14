import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { Platform } from 'react-native';

const shared = {
  authDomain: 'ovella-d17b2.firebaseapp.com',
  projectId: 'ovella-d17b2',
  storageBucket: 'ovella-d17b2.firebasestorage.app',
  messagingSenderId: '383346406590',
};

const iosConfig = {
  ...shared,
  apiKey: 'AIzaSyBUr6jL5aHB46HZ_dzQoKLqbBnkWaX6VT0',
  appId: '1:383346406590:ios:fb0dee07e21cb1d6b01aef',
};

const androidConfig = {
  ...shared,
  apiKey: 'AIzaSyA8DeASyODvJomMGTOyt3HJCI7EQzsKuH4',
  appId: '1:383346406590:android:258f5ad69e7363deb01aef',
};

const firebaseConfig = Platform.OS === 'android' ? androidConfig : iosConfig;

export const firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);

function createAuth() {
  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(firebaseApp);
  }
}

export const firebaseAuth = createAuth();
