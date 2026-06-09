import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParams } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { NewCeremonyScreen } from '../screens/NewCeremonyScreen';
import { CeremonyDetailScreen } from '../screens/CeremonyDetailScreen';
import { AuthoritiesScreen } from '../screens/AuthoritiesScreen';
import { TribunaScreen } from '../screens/TribunaScreen';
import { PrecedenceScreen } from '../screens/PrecedenceScreen';
import { ExportScreen } from '../screens/ExportScreen';

const Stack = createNativeStackNavigator<RootStackParams>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="NewCeremony" component={NewCeremonyScreen} />
        <Stack.Screen name="CeremonyDetail" component={CeremonyDetailScreen} />
        <Stack.Screen name="Authorities" component={AuthoritiesScreen} />
        <Stack.Screen name="Tribuna" component={TribunaScreen} />
        <Stack.Screen name="Precedence" component={PrecedenceScreen} />
        <Stack.Screen name="Export" component={ExportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
