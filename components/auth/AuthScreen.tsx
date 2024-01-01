import {StyleSheet, View} from 'react-native';
import {BACKGROUND_COLOR} from "../../styles/colors";
import {auth} from "../../firebase/config";
import {GoogleSignin, GoogleSigninButton} from '@react-native-google-signin/google-signin';
import Toast from 'react-native-simple-toast';
import {useSelector} from "react-redux";
import {selectAuthState} from "../../redux/selectors";
import React, {useEffect} from "react";
import Spinner from "react-native-loading-spinner-overlay";
import {signInAsyncGoogle} from "../../redux/slices/authSlice";
import {useAppDispatch} from "../../hooks";

export default function AuthScreen() {
    const dispatch = useAppDispatch();
    const authState = useSelector(selectAuthState);

    useEffect(() => {
        auth.signOut()
        GoogleSignin.signOut()
    })

    const signInGoogle = async () => {
        try {
            await dispatch(signInAsyncGoogle()).unwrap()
            console.log("logged in as: " + auth.currentUser?.uid)
        } catch (rejectedValueOrSerializedError) {
            if (authState.error !== "Sign in action cancelled") {
                Toast.show("Ошибка авторизации", Toast.LONG)
            }
            console.log("error: " + authState.error)
        }
    }

    return (
        <View style={styles.container}>
            <Spinner
                visible={authState.loading}
                textContent={'Авторизация...'}
                textStyle={{color: "white"}}
            />

            <GoogleSigninButton
                style={styles.googleButton}
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Light}
                onPress={signInGoogle}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND_COLOR,
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleButton: {
        width: "70%",
        height: "6%"
    }
});
