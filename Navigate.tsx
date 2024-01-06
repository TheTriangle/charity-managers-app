import {createStackNavigator} from "@react-navigation/stack";
import AuthScreen from "./ui/auth/screens/AuthScreen"
import {NavigationContainer} from "@react-navigation/native";
import MainScreen from "./ui/main/screens/MainScreen";
import ProfileFill from "./ui/profile/screens/ProfileFill";
import {useSelector} from "react-redux";
import {selectAuthState} from "./redux/selectors";

const commonOptions = {
    headerShown: false,
}

const loginOptions = {
    ...commonOptions
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
                : // Если есть профиль, то показываем мейн, если нет, то показываем филл
                <>
                    <MainStack.Screen name="Fill" component={ProfileFill} options={commonOptions}/>
                    <MainStack.Screen name="Main" component={MainScreen} options={commonOptions}/>
                </>
            }
        </MainStack.Navigator>
    </NavigationContainer>
}
