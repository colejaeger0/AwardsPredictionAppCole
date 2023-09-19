import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from './BottomTabNavigator';
import AuthenticatorNavigator from './AuthenticatorNavigator';
import WebView from '../screens/WebView';
import { StatusBar } from 'expo-status-bar';

const { Navigator, Screen } = createStackNavigator();

const MainNavigator = () => (
  <>
    <StatusBar style={'light'} />
    <Navigator
      initialRouteName="BottomTabNavigator"
      screenOptions={{
        headerShown: false,
        animationTypeForReplace: 'push',
      }}
    >
      <Screen name="BottomTabNavigator" component={BottomTabNavigator} />
      <Screen name="Authenticator" component={AuthenticatorNavigator} />
      <Screen name="WebView" component={WebView} />
    </Navigator>
  </>
);

export default MainNavigator;
