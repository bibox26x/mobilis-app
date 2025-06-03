import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme, theme } from '@/utils/context/ThemeContext';


const ICONS: Record<'mainpage' | 'settings', { name: React.ComponentProps<typeof MaterialIcons>['name']; label: string }> = {
  mainpage: { name: 'assignment', label: 'Tasks' },
  settings: { name: 'settings', label: 'Settings' },
};

const TAB_BAR_HEIGHT = 60;
const BOTTOM_INSET = Platform.select({
  ios: 0,
  android: StatusBar.currentHeight ? Math.max(StatusBar.currentHeight - 10, 0) : 0,
});

import { Tabs, useRouter, useSegments } from 'expo-router';

interface CustomTabBarProps {
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
  descriptors: Record<string, any>;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors }) => {
  const router = useRouter();
  const segments = useSegments();
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <SafeAreaView
        edges={['bottom']}
        style={[styles.safeArea, { paddingBottom: BOTTOM_INSET }]}
      >
        <View style={[styles.footer, { borderTopColor: currentTheme.border }]}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const { name } = route;
            if (name !== 'mainpage' && name !== 'settings') return null;
            const icon = ICONS[name];
            const onPress = () => {
              if (!focused) {
               // @ts-ignore
                router.push(`/home/${route.name}`);
              }
            };
            return (
              <TouchableOpacity
                key={name}
                style={styles.footerButton}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={descriptors[route.key].options.tabBarAccessibilityLabel}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={icon.name}
                  size={24}
                  color={focused ? '#53B946' : currentTheme.secondaryText}
                  style={{ marginBottom: 4 }}
                />
                <Text
                  style={[
                    styles.footerButtonText,
                    {
                      color: focused ? '#53B946' : currentTheme.secondaryText,
                    },
                  ]}
                >
                  {icon.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: TAB_BAR_HEIGHT,
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 2,
  },
  footerButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
});

export default CustomTabBar;
