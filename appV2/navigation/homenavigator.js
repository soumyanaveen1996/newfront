import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
    createDrawerNavigator,
    DrawerContentScrollView,
    DrawerToggleButton
} from '@react-navigation/drawer';
import HomeTabView from '../Screens/Home/HomeTab/HomeTab';
import { Image, View } from 'react-native';
import { Text, Keyboard } from 'react-native';
import { Button, Icon } from '@rneui/themed';
import AppCatelog from '../Screens/Home/AppsTab/AppCatelog';
import BotChat from '../Screens/Chat/BotChat';
import PeopleChat from '../Screens/Chat/PeopleChat';
import { ChannelChat } from '../Screens/Chat';
import NavigationAction from './NavigationAction';
import ContactsScreen from '../Screens/Contacts/ContactsScreen';
import GlobalColors from '../config/styles';
import TabIcon from '../widgets/TabIcon/TabIcon';
import images from '../config/images';
import { TouchableOpacity } from 'react-native';
import Icons from '../config/icons';
import i18n from '../config/i18n/i18n';
import configToUse from '../config/config';
import CallHistory from '../Screens/Home/CallsTab/CallHistory';
import Drawer from '../Screens/Drawer/Drawer';
import DomainLogo from '../widgets/DomainLogo/DomainLogo';
import UserDomainsManager from '../lib/UserDomainsManager/UserDomainsManager';
import CustomHome from '../Screens/Home/CustomHomeTab/CustomHome';
import { HeaderDmainLogo } from './HeaderButtons';
import { isTabletOrIpad } from '../lib/utils/DeviceTypeUtils';
import AppFonts from '../config/fontConfig';
const Tab = createBottomTabNavigator();
const SingleTab = createNativeStackNavigator();
const ChatDrawer = createDrawerNavigator();
const MainDrawer = createDrawerNavigator();

const HomeStack = createNativeStackNavigator();
const CallStack = createNativeStackNavigator();
const ContactStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const CustomHomeStack = createNativeStackNavigator();

const HomeTab = ({ route }) => {
    const params = route.params || {};
    return (
        <HomeStack.Navigator
            screenOptions={{
                headerTitleAlign: 'center',
                headerStyle: {
                    backgroundColor: GlobalColors.toolbarBackground
                },
                headerTitleStyle: {
                    color: GlobalColors.white,
                    fontWeight: AppFonts.BOLD,
                    fontSize: 14
                }
            }}
        >
            <HomeStack.Screen
                name={'Home'}
                component={HomeTabView}
                initialParams={params}
                options={({ route }) => ({
                    title: route.params?.title,
                    headerLeft: () => {
                        if (configToUse.customHomeScreen) return null;
                        return (
                            <TouchableOpacity
                                accessibilityLabel="Open Drawer"
                                testID="drawer-icon"
                                onPress={() => {
                                    Keyboard.dismiss();
                                    NavigationAction.toggleDrawer();
                                }}
                            >
                                <HeaderDmainLogo />
                            </TouchableOpacity>
                        );
                    },

                    headerRight: () => {
                        if (configToUse.contactsAvailable)
                            return (
                                <TouchableOpacity
                                    accessibilityLabel="Call Icon"
                                    testID="call-icon"
                                    onPress={() =>
                                        NavigationAction.push(
                                            NavigationAction.SCREENS.newChat
                                        )
                                    }
                                >
                                    {Icons.headerGroupAdd({
                                        size: 35,
                                        color: GlobalColors.white
                                    })}
                                </TouchableOpacity>
                            );
                        else return null;
                    }
                })}
            />
        </HomeStack.Navigator>
    );
};
const CallTab = ({ route }) => {
    return (
        <CallStack.Navigator
            screenOptions={{
                headerTitleAlign: 'center',
                headerStyle: {
                    backgroundColor: GlobalColors.toolbarBackground
                },
                headerTitleStyle: {
                    color: GlobalColors.white,
                    fontWeight: AppFonts.BOLD,
                    fontSize: 14
                }
            }}
        >
            <CallStack.Screen
                name={'Calls'}
                component={CallHistory}
                options={{ title: i18n.t('callHistory') }}
            />
        </CallStack.Navigator>
    );
};

const CustomHomeTab = ({ route }) => {
    const params = route.params || {};
    return (
        <CustomHomeStack.Navigator
            screenOptions={{
                headerTitleAlign: 'center',
                headerStyle: {
                    backgroundColor: GlobalColors.toolbarBackground
                },
                headerTitleStyle: {
                    color: GlobalColors.white,
                    fontWeight: AppFonts.BOLD,
                    fontSize: 14
                }
            }}
        >
            <CallStack.Screen
                name={'Home'}
                component={CustomHome}
                initialParams={params}
                options={({ route }) => ({
                    title: i18n.t('customHome'),
                    headerLeft: () => {
                        return (
                            <TouchableOpacity
                                accessibilityLabel="Open Drawer"
                                testID="drawer-icon"
                                onPress={() => {
                                    Keyboard.dismiss();
                                    NavigationAction.toggleDrawer();
                                }}
                            >
                                <HeaderDmainLogo />
                            </TouchableOpacity>
                        );
                    }
                })}
            />
        </CustomHomeStack.Navigator>
    );
};

const ContactTab = ({ route }) => {
    return (
        <ContactStack.Navigator
            screenOptions={{
                headerTitleAlign: 'center',
                headerStyle: {
                    backgroundColor: GlobalColors.toolbarBackground
                },
                headerTitleStyle: {
                    color: GlobalColors.white,
                    fontWeight: AppFonts.BOLD,
                    fontSize: 14
                }
            }}
        >
            <ContactStack.Screen
                name={'Contacts'}
                component={ContactsScreen}
                options={({ route }) => ({
                    headerRight: () => (
                        <TouchableOpacity
                            accessibilityLabel="Call Icon"
                            testID="call-icon"
                            onPress={() => {
                                NavigationAction.push(
                                    NavigationAction.SCREENS.addressBookScreen,
                                    {
                                        title: `Import Contacts`,
                                        contactImport: true
                                    }
                                );
                            }}
                        >
                            <Image
                                source={images.import_contact_icon}
                                style={{
                                    tintColor: GlobalColors.white
                                }}
                            />
                        </TouchableOpacity>
                    )
                })}
            />
        </ContactStack.Navigator>
    );
};
const AppTab = ({ route }) => {
    return (
        <AppStack.Navigator
            screenOptions={{
                headerTitleAlign: 'center',
                headerStyle: {
                    backgroundColor: GlobalColors.toolbarBackground
                },
                headerTitleStyle: {
                    color: GlobalColors.white,
                    fontWeight: AppFonts.BOLD,
                    fontSize: 14
                }
            }}
        >
            <AppStack.Screen
                name={'Apps'}
                component={AppCatelog}
                options={{
                    // headerShown: false,
                    animation: 'slide_from_right'
                }}
            />
        </AppStack.Navigator>
    );
};

export function MainScreenDrawer(props) {
    const params = props.route.params || {};
    return (
        <MainDrawer.Navigator
            initialRouteName={NavigationAction.SCREENS.drawerScreen}
            options={{ headerShown: false }}
            drawerContent={({ navigation }) => (
                <View
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: GlobalColors.appBackground
                    }}
                >
                    <Drawer />
                </View>
            )}
        >
            <MainDrawer.Screen
                component={MainScreenTabs}
                headerShown={false}
                name={NavigationAction.SCREENS.drawerScreen}
                initialParams={params}
                options={{ headerShown: false }}
            ></MainDrawer.Screen>
        </MainDrawer.Navigator>
    );
}

export function MainScreenTabs(props) {
    const params = props.route.params || {};
    if (configToUse.showBottomTabs)
        return (
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarShowLabel: false,
                    tabBarIcon: ({ focused, color, size }) => {
                        return <TabIcon focused={focused} title={route.name} />;
                    },
                    tabBarStyle: [
                        {
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 0.4 },
                            paddingBottom: 6,
                            shadowOpacity: 0.3,
                            backgroundColor:
                                GlobalColors.bottomTabBarBackground,
                            borderTopWidth: 0
                        },
                        isTabletOrIpad() ? { minHeight: 75 } : {}
                    ],
                    tabBarActiveTintColor: GlobalColors.activeTabColor,
                    tabBarInactiveTintColor: GlobalColors.inactiveTabColor,
                    headerShown: false
                })}
            >
                {configToUse.customHomeScreen && (
                    <Tab.Screen
                        name="Home"
                        component={CustomHomeTab}
                        initialParams={{ initialProps: params.initialProps }}
                    />
                )}
                <Tab.Screen
                    name={configToUse.customHomeScreen ? 'Chats' : 'Home'}
                    component={HomeTab}
                    initialParams={{
                        newLogin: props.route.params?.newLogin,
                        initialProps: configToUse.customHomeScreen
                            ? undefined
                            : params.initialProps,
                        test: 'test'
                    }}
                />
                {(configToUse.showPSTNCalls || configToUse.showVoipCalls) && (
                    <Tab.Screen name="Calls" component={CallTab} />
                )}
                <Tab.Screen name="Contacts" component={ContactTab} />
                {configToUse.showApps && (
                    <Tab.Screen name="Apps" component={AppTab} />
                )}
            </Tab.Navigator>
        );
    else
        return (
            <SingleTab.Navigator
                screenOptions={{
                    headerShown: false
                }}
            >
                <SingleTab.Screen
                    name="Home"
                    component={HomeTab}
                    initialParams={{
                        newLogin: props.route.params?.newLogin,
                        initialProps: params.initialProps,
                        test: 'test'
                    }}
                />
            </SingleTab.Navigator>
        );
}

export function MainScreenChat(props) {
    const params = props.route.params || {};
    return (
        <HomeStack.Navigator
            screenOptions={({ route }) => ({
                headerShown: false
            })}
        >
            <HomeStack.Screen
                name="Home"
                component={HomeTab}
                initialParams={{
                    newLogin: props.route.params?.newLogin,
                    initialProps: params.initialProps,
                    test: 'test'
                }}
                screenOptions={({ route }) => ({
                    headerShown: false
                })}
            />
        </HomeStack.Navigator>
    );
}

export function BotChatScreenDrawer({ route }) {
    return (
        <ChatDrawer.Navigator
            initialRouteName={NavigationAction.SCREENS.bot}
            screenOptions={{
                drawerPosition: 'right',
                headerLeft: false,
                headerTitleAlign: 'center',
                headerRight: () => <DrawerToggleButton />
            }}
            drawerContent={({ navigation }) => (
                <DrawerContentScrollView>
                    <View style={{ flex: 1 }}>
                        <Button
                            title="close"
                            onPress={() => {
                                navigation.pop();
                            }}
                        />
                    </View>
                </DrawerContentScrollView>
            )}
        >
            <ChatDrawer.Screen
                name={NavigationAction.SCREENS.bot}
                component={BotChat}
                options={({ route }) => {
                    return { title: route.params.bot?.botName };
                }}
            />
        </ChatDrawer.Navigator>
    );
}

export function PeopleChatScreenDrawer() {
    return (
        <ChatDrawer.Navigator
            initialRouteName={NavigationAction.SCREENS.peopleChat}
            screenOptions={{
                drawerPosition: 'right',
                headerLeft: false,
                headerTitleAlign: 'center',
                headerRight: () => <DrawerToggleButton />
            }}
            drawerContent={({ navigation }) => (
                <DrawerContentScrollView>
                    <View style={{ flex: 1, backgroundColor: 'red' }}>
                        <Button
                            title="close"
                            onPress={() => {
                                navigation.pop();
                            }}
                        />
                    </View>
                </DrawerContentScrollView>
            )}
        >
            <ChatDrawer.Screen
                name={NavigationAction.SCREENS.peopleChat}
                component={PeopleChat}
                options={({ route }) => ({ title: route.params?.title })}
            />
        </ChatDrawer.Navigator>
    );
}
export function ChannelChatScreenDrawer() {
    return (
        <ChatDrawer.Navigator
            initialRouteName="ChatBotScreen"
            screenOptions={{
                drawerPosition: 'right',
                headerLeft: false,
                headerTitleAlign: 'center',
                headerRight: () => <DrawerToggleButton />
            }}
            drawerContent={() => (
                <DrawerContentScrollView>
                    <View style={{ flex: 1, backgroundColor: 'red' }}>
                        <Text>side bar</Text>
                    </View>
                </DrawerContentScrollView>
            )}
        >
            <ChatDrawer.Screen
                name={NavigationAction.SCREENS.channelChat}
                component={ChannelChat}
                options={({ route }) => ({ title: route.params.title })}
            />
        </ChatDrawer.Navigator>
    );
}
