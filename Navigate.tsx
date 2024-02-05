import {createStackNavigator, StackScreenProps} from "@react-navigation/stack";
import AuthScreen from "./ui/auth/screens/AuthScreen"
import {getFocusedRouteNameFromRoute, NavigationContainer} from "@react-navigation/native";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import OrganizationsScreen from "./ui/main/screens/OrganizationsScreen";
import ProfileFill from "./ui/profile/screens/ProfileFill";
import {useSelector} from "react-redux";
import {selectAuthState} from "./redux/selectors";
import ProfileScreen from "./ui/profile/screens/ProfileScreen";
import {SvgXml} from "react-native-svg";
import {iconHome} from "./assets/iconHome";
import {iconProfile} from "./assets/iconProfile";
import CharityCreationScreen from "./ui/charity/screens/CharityCreationScreen";
import React from "react";
import {CharityModel} from "./data/model/СharityModel";

const commonOptions = {
    headerShown: false,
}

const loginOptions = {
    ...commonOptions
}

const organizationsTabOptions = {
    ...commonOptions,
    tabBarIcon: ({focused}: {
        focused: boolean
    }) => {
        const color = focused ? "#2E5C40" : "white"
        return <SvgXml xml={iconHome} stroke={"#2E5C40"} fill={color}/>;
    },
    tabBarLabel: "Организации",
    tabBarShowLabel: false

}

const profileTabOptions = {
    ...commonOptions,
    tabBarIcon: ({focused}: {
        focused: boolean
    }) => {
        const color = focused ? "#2E5C40" : "white"
        return <SvgXml xml={iconProfile} fill={color}/>;
    },
    tabBarLabel: "Организации",
    tabBarShowLabel: false

}

const profileOptions = {
    ...commonOptions,

}

const organizationsOptions = {
    ...commonOptions,

}

const creationOptions = {
    ...commonOptions,
}

const ProfileStack = createStackNavigator()

const ProfileStackNavigator = () => {
    return <ProfileStack.Navigator>
        <ProfileStack.Screen name={"Profile"} component={ProfileScreen} options={profileOptions}/>
    </ProfileStack.Navigator>
}

type OrganizationsStackParamList = {
    AllOrganizations: undefined,
    CreateCharity: {
        charity?: CharityModel
    }
}

export type CreateCharityProps = StackScreenProps<OrganizationsStackParamList, 'CreateCharity'>;

const OrganizationsStack = createStackNavigator<OrganizationsStackParamList>()

// @ts-ignore
const OrganizationsStackNavigator = ({ navigation, route }) => {
    const tabHiddenRoutes = ["CreateCharity"];
    React.useLayoutEffect(() => {
        // const routeName = getFocusedRouteNameFromRoute(route);
        if (tabHiddenRoutes.includes(getFocusedRouteNameFromRoute(route) as string)){
            navigation.setOptions({tabBarStyle: {height: "8%", display: 'none'}});
        } else {
            navigation.setOptions({tabBarStyle: {height: "8%", display: 'flex'}});
        }
    }, [navigation, route]);
    return <OrganizationsStack.Navigator>
        <OrganizationsStack.Screen name={"AllOrganizations"} component={OrganizationsScreen} options={organizationsOptions}/>
        <OrganizationsStack.Screen name={"CreateCharity"} component={CharityCreationScreen} options={creationOptions}/>
    </OrganizationsStack.Navigator>
}

const Tab = createBottomTabNavigator()

const TabsNavigator = () => {

    return <Tab.Navigator screenOptions={{
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "grey",
        tabBarStyle: {
            height: "8%",
        }
    }}>
        <Tab.Screen name={"OrganizationsStack"} component={OrganizationsStackNavigator} options={organizationsTabOptions}/>
        <Tab.Screen name={"ProfileStack"} component={ProfileStackNavigator}
                    options={profileTabOptions}/>
    </Tab.Navigator>
}

const MainStack = createStackNavigator()


export default function Navigate() {
    const authState = useSelector(selectAuthState);

    return <NavigationContainer>
        <MainStack.Navigator>
            {!authState.authorized ?
                <>
                    <MainStack.Screen name="Login" component={AuthScreen} options={loginOptions}/>
                </>
                : !authState.hasProfile ?
                    <>
                        <MainStack.Screen name="Fill" component={ProfileFill} options={commonOptions}/>
                    </>
                    :
                    <>
                        <MainStack.Screen name="Main" component={TabsNavigator} options={commonOptions}/>
                    </>
            }
        </MainStack.Navigator>
    </NavigationContainer>
}
