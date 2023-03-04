import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BackButton from '../components/Buttons/BackButton';
import { getHeaderTitle } from '../constants';
import ManageEvents from '../screens/Admin/ManageEvents.tsx';
import Admin from '../screens/Admin';
import ManageStudios from '../screens/Admin/ManageStudios';
import ManageContenders from '../screens/Admin/ManageContenders';
import AddTestUser from '../screens/Admin/AddTestUser';
import { useHeaderSettings } from '../hooks/useHeaderSettings';

const { Navigator, Screen } = createStackNavigator();

const AdminNavigator = () => {
  const { medium } = useHeaderSettings();
  return (
    <Navigator
      initialRouteName="Proflie"
      headerMode={'screen'}
      screenOptions={{
        animationTypeForReplace: 'push',
      }}
    >
      <Screen
        name="Admin"
        component={Admin}
        options={{ headerTitle: getHeaderTitle('Admin Console'), ...medium }}
      />
      <Screen
        name="ManageStudios"
        component={ManageStudios}
        options={{
          headerTitle: getHeaderTitle('Manage Studios'),
          headerLeft: BackButton,
          ...medium,
        }}
      />
      <Screen
        name="ManageEvents"
        component={ManageEvents}
        options={{
          headerTitle: getHeaderTitle('Manage Events'),
          headerLeft: BackButton,
          ...medium,
        }}
      />
      <Screen
        name="ManageContenders"
        component={ManageContenders}
        options={{
          headerTitle: getHeaderTitle('Manage Contenders'),
          headerLeft: BackButton,
          ...medium,
        }}
      />
      <Screen
        name="AddTestUser"
        component={AddTestUser}
        options={{
          headerTitle: getHeaderTitle('Add Test User'),
          headerLeft: BackButton,
          ...medium,
        }}
      />
    </Navigator>
  );
};

export default AdminNavigator;
