import {StyleSheet, Text, View} from 'react-native';
import MainStack from './Navigate'
import {Provider, useSelector} from "react-redux";
import {store} from "./redux/store";
import React, {useCallback, useEffect, useState} from "react";
import {auth} from "./firebase/config";
import * as SplashScreen from 'expo-splash-screen';
import {authorize} from "./redux/slices/authSlice";


SplashScreen.preventAutoHideAsync();
export default function App() {
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        return auth.onAuthStateChanged((user) => {
            if (user !== null) {
                store.dispatch(authorize())
            }
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
                <MainStack />
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
