import {createStackNavigator} from "@react-navigation/stack";
import AuthScreen from "./ui/auth/screens/AuthScreen"
import {NavigationContainer} from "@react-navigation/native";

const commonOptions = {
    headerShown: false,
}

const loginOptions = {
    ...commonOptions
}

const MainStack = createStackNavigator()

export default function Navigate() {
    return <NavigationContainer>
        <MainStack.Navigator>
            <MainStack.Screen name="Login" component={AuthScreen} options={loginOptions}/>
        </MainStack.Navigator>
    </NavigationContainer>
}
