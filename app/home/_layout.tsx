import { Tabs } from 'expo-router';
import CustomTabBar from '../components/CustomTabBar';
import React from 'react';
import { useTheme } from '../context/ThemeContext';

const HomeLayout: React.FC = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { 
          display: 'flex',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 8,
        },
      }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tabs.Screen 
        name="mainpage" 
        options={{ 
          title: 'Tasks', 
          tabBarLabel: 'Tasks',
        }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{ 
          title: 'Settings', 
          tabBarLabel: 'Settings',
        }} 
      />
    </Tabs>
  );
};

export default HomeLayout;
