import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import EventSelect from '../screens/Home/EventSelect';
import CategorySelect from '../screens/Home/CategorySelect';
import { HomeParamList } from './types';
import Contenders from '../screens/Home/Contenders';
import BackButton from '../components/Buttons/BackButton';
import ContenderDetails from '../screens/Home/ContenderDetails';
import CreateContender from '../screens/CreateContender';

const { Navigator, Screen } = createStackNavigator<HomeParamList>();

const HomeNavigator = () => (
  <Navigator initialRouteName="EventSelect" headerMode="screen">
    <Screen
      name="EventSelect"
      component={EventSelect}
      options={{
        headerTitle: 'Events',
      }}
    />
    <Screen
      name="CategorySelect"
      component={CategorySelect}
      options={{
        headerTitle: 'Categories',
        headerLeft: BackButton,
      }}
    />
    <Screen
      name="Contenders"
      component={Contenders}
      options={{
        headerTitle: 'Contenders',
        headerLeft: BackButton,
      }}
    />
    <Screen
      name="CreateContender"
      component={CreateContender}
      options={{
        headerTitle: 'Add Contender',
        headerLeft: BackButton,
      }}
    />
    <Screen
      name="ContenderDetails"
      component={ContenderDetails}
      options={{
        headerTitle: '',
        headerLeft: BackButton,
      }}
    />
  </Navigator>
);

export default HomeNavigator;
