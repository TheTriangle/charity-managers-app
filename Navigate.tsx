import {createStackNavigator} from "@react-navigation/stack";
import AuthScreen from "./ui/auth/screens/AuthScreen"
import {NavigationContainer} from "@react-navigation/native";
import {auth} from "./firebase/config";
import MainScreen from "./ui/main/screens/MainScreen";
import {useEffect, useState} from "react";
import firebase from "firebase/compat";
import User = firebase.User;

const commonOptions = {
    headerShown: false,
}

const loginOptions = {
    ...commonOptions
}

const MainStack = createStackNavigator()



export default function Navigate() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        return auth.onAuthStateChanged((user) => {
            setUser(user);
        });
    }, []);


    return <NavigationContainer>
        <MainStack.Navigator>
            {user === null ?
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
