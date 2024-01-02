import {StyleSheet, View, TextInput, Alert} from 'react-native';
import {BACKGROUND_COLOR, BORDER_COLOR_RED} from "../../../styles/colors";
import {auth} from "../../../firebase/config";
import {GoogleSignin, GoogleSigninButton} from '@react-native-google-signin/google-signin';
import Toast from 'react-native-simple-toast';
import {useSelector} from "react-redux";
import {selectAuthState} from "../../../redux/selectors";
import React, {useState} from "react";
import Spinner from "react-native-loading-spinner-overlay";
import {signInAsyncEmail, signInAsyncGoogle, signUpAsyncEmail} from "../../../redux/slices/authSlice";
import {useAppDispatch} from "../../../hooks";
import {textInput} from "../../../styles/styles";
import PrivacyPolicyLabel from "../components/PrivacyPolicyLabel";
import AuthButton from "../components/AuthButton";
import firebase from "firebase/compat";
import {userExists} from "../../../data/repo/repository";

export default function AuthScreen() {
    const dispatch = useAppDispatch();
    const authState = useSelector(selectAuthState);
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [validEmail, setValidEmail] = useState(true)
    const [validPassword, setValidPassword] = useState(true)

    // useEffect(() => {
    //     auth.signOut()
    //     GoogleSignin.signOut()
    // })

    const isFirebaseError = (error: any): error is firebase.auth.Error => {
        return typeof error.code === 'string' && typeof error.message === 'string';
    };

    const signInGoogle = async () => {
        try {
            await dispatch(signInAsyncGoogle()).unwrap()
            console.log("logged in as: " + auth.currentUser?.uid)
        } catch (e) {
            if (authState.error !== "Sign in action cancelled") {
                Toast.show("Ошибка авторизации", Toast.LONG)
            }
            console.log("Google auth error: " + authState.error)
        }
    }

    const validatePassword = () => {
        const regex = /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9]{8,32}$/;
        return regex.test(password)
    }

    const signInEmail = async () => {
        try {
            const exists = await userExists(email)

            if (exists) {
                await dispatch(signInAsyncEmail({email, password})).unwrap()
                console.log("logged in as: " + auth.currentUser?.uid)
            } else {
                Alert.alert(
                    'Пользователь не найден',
                    'Пользователь с указанной электронной почтой не найден.\n' +
                    'Вы хотите зарегистрироваться с этими данными?',
                    [
                        {
                            text: 'Нет',
                            style: 'cancel',
                        },
                        {
                            text: 'Да',
                            onPress: async () => {
                                if (validatePassword()) {
                                    await dispatch(signUpAsyncEmail({email, password})).unwrap()
                                    console.log("logged in as: " + auth.currentUser?.uid)
                                } else {
                                    Alert.alert('Некорректный пароль', 'Пароль должен быть длиной от 8 до 32 символов, состоять из латнских символов, содержать минимум одну заглавную, одну строчную и одну цифру.');
                                }
                            },
                        },
                    ],
                );
            }

        } catch (e) {
            if (isFirebaseError(e)) {
                if (e.code == "auth/wrong-password") {
                    Toast.show("Введен неверный пароль", Toast.LONG)
                }
            }
            console.log("Email auth error: " + authState.error)
        }
    }

    const validateEmail = (email: string) => {
        const expression = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!expression.test(String(email).toLowerCase())) {
            setValidEmail(false)
            return false
        }
        setValidEmail(true)
        return true
    }

    return (
        <View style={styles.container}>
            <View style={{
                flex: 1, alignItems: 'center',
                justifyContent: 'center',
                width: "100%"
            }}>

                <Spinner
                    visible={authState.loading}
                    textContent={'Авторизация...'}
                    textStyle={{color: "white"}}
                />

                <TextInput
                    style={[{
                        ...textInput,
                        width: "70%",
                        height: "5%"
                    }, email.length == 0 ? {} : (validEmail ? {} : {borderColor: BORDER_COLOR_RED})]}
                    placeholder={"Email"}
                    autoComplete={"email"}
                    autoCorrect={false}
                    onChangeText={(text) => setEmail(text)}
                    onBlur={() => validateEmail(email)}
                    onFocus={() => setValidEmail(true)}
                />


                <TextInput style={[{
                    ...textInput,
                    width: "70%",
                    height: "5%"
                }, validPassword ? {} : {borderColor: BORDER_COLOR_RED}]}
                           placeholder={"Password"}
                           secureTextEntry={true}
                           maxLength={32}
                           onChangeText={(text) => setPassword(text)}
                           onFocus={() => setValidPassword(true)}
                />

                <AuthButton text={"Continue with email"} onPress={() => {
                    if (!validateEmail(email)) {
                        setValidEmail(false)
                        return
                    }
                    if (password.length == 0) {
                        setValidPassword(false)
                        return
                    }
                    signInEmail()
                }}
                />
                <GoogleSigninButton
                    style={styles.googleButton}
                    size={GoogleSigninButton.Size.Wide}
                    color={GoogleSigninButton.Color.Light}
                    onPress={signInGoogle}
                />
            </View>
            <PrivacyPolicyLabel/>
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
