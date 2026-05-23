import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ResponsiveTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const { colors } = useTheme();
    const { buildHref } = useLinkBuilder();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const isDesktop = width > 768;

    const visibleRoutes = state.routes.filter(
        (route) => (descriptors[route.key].options as any).href !== null
    );

    if (isDesktop) {
        return (
            <View style={styles.sidebarContainer}>
                <View style={styles.sidebarContent}>
                    <Text style={styles.sidebarHeader}>Nota</Text>
                    {visibleRoutes.map((route) => {
                        const index = state.routes.findIndex((r) => r.key === route.key);
                        const { options } = descriptors[route.key];
                        const label =
                            options.tabBarLabel !== undefined
                                ? options.tabBarLabel
                                : options.title !== undefined
                                    ? options.title
                                    : route.name;

                        const isFocused = state.index === index;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name, route.params);
                            }
                        };

                        const onLongPress = () => {
                            navigation.emit({
                                type: 'tabLongPress',
                                target: route.key,
                            });
                        };

                        return (
                            <PlatformPressable
                                key={route.key}
                                href={buildHref(route.name, route.params)}
                                accessibilityState={isFocused ? { selected: true } : {}}
                                accessibilityLabel={options.tabBarAccessibilityLabel}
                                testID={options.tabBarButtonTestID}
                                onPress={onPress}
                                onLongPress={onLongPress}
                                style={[
                                    styles.sidebarItem,
                                    isFocused && styles.sidebarItemFocused,
                                ]}
                            >
                                {options.tabBarIcon?.({
                                    focused: isFocused,
                                    color: isFocused ? '#000' : '#888',
                                    size: 24,
                                })}
                                <Text style={[
                                    styles.sidebarLabel,
                                    { color: isFocused ? '#000' : '#888' }
                                ]}>
                                    {typeof label === 'string' ? label : route.name}
                                </Text>
                            </PlatformPressable>
                        );
                    })}
                </View>
            </View>
        );
    }

    // Mobile Bottom Tab Bar
    return (
        <View style={[styles.tabBar, { paddingBottom: insets.bottom + 8 }]}>
            {visibleRoutes.map((route) => {
                        const index = state.routes.findIndex((r) => r.key === route.key);
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                return (
                    <PlatformPressable
                        key={route.key}
                        href={buildHref(route.name, route.params)}
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarButtonTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={styles.tabItem}
                    >
                        {options.tabBarIcon?.({
                            focused: isFocused,
                            color: isFocused ? '#fff' : '#666',
                            size: 24,
                        })}
                        <Text style={[
                            styles.tabLabel,
                            { color: isFocused ? '#fff' : '#666' }
                        ]}>
                            {typeof options.tabBarLabel === 'string'
                                ? options.tabBarLabel
                                : typeof options.title === 'string'
                                    ? options.title
                                    : route.name}
                        </Text>
                    </PlatformPressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    // Desktop Sidebar Styles
    sidebarContainer: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 250,
        backgroundColor: '#0A0A0A',
        borderRightWidth: 1,
        borderRightColor: '#333',
        paddingTop: 40,
        paddingHorizontal: 16,
        zIndex: 100,
    },
    sidebarContent: {
        flex: 1,
    },
    sidebarHeader: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 40,
        paddingLeft: 12,
    },
    sidebarItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
        gap: 12,
    },
    sidebarItemFocused: {
        backgroundColor: '#fff',
    },
    sidebarLabel: {
        fontSize: 16,
        fontWeight: '600',
    },

    // Mobile Tab Bar Styles
    tabBar: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#0A0A0A',
        borderTopWidth: 1,
        borderTopColor: '#333',
        paddingTop: 8,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '600',
    },
});
