import {createStackNavigator} from "@react-navigation/stack";
import AuthScreen from "./ui/auth/screens/AuthScreen"
import {NavigationContainer} from "@react-navigation/native";
import MainScreen from "./ui/main/screens/MainScreen";

const commonOptions = {
    headerShown: false,
}

const loginOptions = {
    ...commonOptions
}

const MainStack = createStackNavigator()


export default function Navigate({loggedIn} : {loggedIn: boolean}) {

    return <NavigationContainer>
        <MainStack.Navigator>
            {!loggedIn ?
                <>
                    <MainStack.Screen name="Login" component={AuthScreen} options={loginOptions}/>
                </>
                :
                <>
                    <MainStack.Screen name="Main" component={MainScreen} options={loginOptions}/>
                </>
            }
        </MainStack.Navigator>
    </NavigationContainer>
}
