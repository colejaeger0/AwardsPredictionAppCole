import React from 'react';
import SendMessage from '../screens/Help/SendMessage';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Settings from '../screens/Help/Settings';
import { SafeAreaView } from 'react-native-safe-area-context';
import COLORS from '../constants/colors';
import About from '../screens/Help/About';

const Tab = createMaterialTopTabNavigator();

const HelpTabs = () => {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <Tab.Navigator
        tabBarOptions={{
          style: {
            backgroundColor: COLORS.primary,
            borderBottomColor: 'rgba(255,255,255,0.1)',
            borderBottomWidth: 1,
          },
          labelStyle: { color: COLORS.white, fontSize: 14, textTransform: 'none' },
          indicatorStyle: { backgroundColor: COLORS.white },
          activeTintColor: COLORS.primary,
        }}
      >
        <Tab.Screen name="Contact" component={SendMessage} />
        <Tab.Screen name="Settings" component={Settings} />
        <Tab.Screen name="About" component={About} />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default HelpTabs;
