import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import MainStack from './Navigate'
import {Provider} from "react-redux";
import {store} from "./redux/store";
import React, {useCallback, useEffect, useState} from "react";
import {auth} from "./firebase/config";
import * as SplashScreen from 'expo-splash-screen';
import {authorize, hasProfile, signOut} from "./redux/slices/authSlice";
import Toast from "react-native-simple-toast";
import {isFirebaseError} from "./utils/isFirebaseError";
import NetInfo from "@react-native-community/netinfo";
import {BUTTON_ACTIVE_COLOR} from "./styles/colors";
import {KeyboardProvider} from "react-native-keyboard-controller";


SplashScreen.preventAutoHideAsync();
export default function App() {
    const [appIsReady, setAppIsReady] = useState(false);

    const [noInternet, setNoInternet] = useState(false)

    const [loading, setLoading] = useState(false)
    
    useEffect(() => {
        return auth.onAuthStateChanged(async (user) => {
            console.log("auth: "+user?.uid)
            if (user !== null) {
                try {
                    await store.dispatch(hasProfile()).unwrap()
                    store.dispatch(authorize())
                    console.log(store.getState().auth)
                } catch (e) {
                    if (isFirebaseError(e)) {
                        console.log("firebase error: " + e.code + " " + e.message)
                        if (e.code == "unavailable") {
                            setNoInternet(true)
                        }
                    }
                    await store.dispatch(signOut()).unwrap()
                    Toast.show("Ошибка авторизации", Toast.LONG)
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


    if (noInternet) {
        return <View style={{flex: 1, alignItems: "center", justifyContent: "center"}} onLayout={onLayoutRootView}>
            <Text style={{fontSize: 18, fontWeight: "500"}}>Нет подключения к сети</Text>
            {!loading ? <Pressable style={styles.buttonContainer} onPress={async () => {
                setLoading(true)
                const isConnected = await NetInfo.fetch().then(state => state.isConnected);
                if (!isConnected) {
                    Toast.show("Проверьте подключение к сети", Toast.LONG)
                    setLoading(false)
                } else {
                    if (auth.currentUser !== null) {
                        try {
                            await store.dispatch(hasProfile()).unwrap()
                            store.dispatch(authorize())
                            setNoInternet(false)
                            setLoading(false)
                        } catch (e) {
                            if (isFirebaseError(e)) {
                                console.log(e.code)
                                if (e.code == "unavailable") {
                                    setNoInternet(true)
                                }
                                setLoading(false)
                                return
                            }
                            store.dispatch(signOut())
                            setLoading(false)
                            setNoInternet(false)
                            Toast.show("Ошибка авторизации", Toast.LONG)
                        }
                    }
                }
            }}>
                <Text style={styles.buttonText}>Попробовать снова</Text>
            </Pressable>
            :
                <ActivityIndicator />
            }
        </View>
    }

    return (
        <View style={{flex: 1}} onLayout={onLayoutRootView}>
            <KeyboardProvider>
                <Provider store={store}>
                    <MainStack/>
                </Provider>
            </KeyboardProvider>
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
    buttonContainer: {
        alignItems: "center",
        alignSelf: "center",
        padding: 8,
        paddingHorizontal: "20%",
        marginVertical: "2%",
        borderRadius: 100,
        backgroundColor: BUTTON_ACTIVE_COLOR
    },
    buttonText: {
        fontWeight: "600",
        fontSize: 20,
        color: "white"
    }
});
