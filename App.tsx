import {StyleSheet, View} from 'react-native';
import MainStack from './Navigate'
import {Provider} from "react-redux";
import {store} from "./redux/store";
import React, {useCallback, useEffect, useState} from "react";
import {auth} from "./firebase/config";
import * as SplashScreen from 'expo-splash-screen';
import {authorize, hasProfile, signOut} from "./redux/slices/authSlice";
import Toast from "react-native-simple-toast";
import {isFirebaseError} from "./utils/isFirebaseError";


SplashScreen.preventAutoHideAsync();
export default function App() {
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        return auth.onAuthStateChanged(async (user) => {
            if (user !== null) {
                try {
                    await store.dispatch(hasProfile()).unwrap()
                    store.dispatch(authorize())
                } catch (e) {
                    if (isFirebaseError(e)) {
                        console.log(e.code)
                    }
                    Toast.show("Ошибка авторизации", Toast.LONG)
                    await store.dispatch(signOut())
                }
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
