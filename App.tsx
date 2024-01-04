import {StyleSheet, Text, View} from 'react-native';
import MainStack from './Navigate'
import {Provider} from "react-redux";
import {store} from "./redux/store";
import React, {useCallback, useEffect, useState} from "react";
import {auth} from "./firebase/config";
import * as SplashScreen from 'expo-splash-screen';


SplashScreen.preventAutoHideAsync();
export default function App() {
    const [appIsReady, setAppIsReady] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false)

    useEffect(() => {
        return auth.onAuthStateChanged((user) => {
            setLoggedIn(user !== null)
            setAppIsReady(true)
        })
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return null
    }

    return (
        <View style={{flex: 1}} onLayout={onLayoutRootView}>
            <Provider store={store}>
                <MainStack loggedIn={loggedIn}/>
            </Provider>
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
