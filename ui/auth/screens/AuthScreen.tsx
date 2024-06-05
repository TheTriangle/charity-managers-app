import {Alert, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {BACKGROUND_COLOR, BORDER_COLOR_RED, BUTTON_ACTIVE_COLOR} from "../../../styles/colors";
import {auth} from "../../../firebase/config";
import {GoogleSigninButton} from '@react-native-google-signin/google-signin';
import Toast from 'react-native-simple-toast';
import {useSelector} from "react-redux";
import {selectAuthState} from "../../../redux/selectors";
import React, {useState} from "react";
import Spinner from "react-native-loading-spinner-overlay";
import {resetPass, signInAsyncEmail, signInAsyncGoogle, signUpAsyncEmail} from "../../../redux/slices/authSlice";
import {useAppDispatch} from "../../../hooks";
import {textInput} from "../../../styles/styles";
import PrivacyPolicyLabel from "../components/PrivacyPolicyLabel";
import AuthButton from "../components/AuthButton";
import {userExists} from "../../../data/repo/repository";
import {AuthMethods} from "../../../data/model/authMethods";
import {isFirebaseError} from "../../../utils/isFirebaseError";
import Modal from "react-native-modal/dist/modal";
import {useSafeAreaFrame} from "react-native-safe-area-context";
import ModalButton from "../../utils/ModalButton";

export default function AuthScreen() {
    const dispatch = useAppDispatch();
    const authState = useSelector(selectAuthState);
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [validEmail, setValidEmail] = useState(true)
    const [validPassword, setValidPassword] = useState(true)
    const [forgotPassVisible, setForgotPassVisible] = useState(false)
    const [recoveryEmail, setRecoveryEmail] = useState("")
    const [loadingTitle, setLoadingTitle] = useState("Authentication...")

    const screenHeight = useSafeAreaFrame().height;
    const textInputHeight = screenHeight * 0.04
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    const signInGoogle = async () => {
        setLoadingTitle("Authentication...")
        try {
            await dispatch(signInAsyncGoogle()).unwrap()
            console.log("logged in as: " + auth.currentUser?.uid)
        } catch (e) {
            if (isFirebaseError(e)) {
                if (e.code != "12501") {
                    Toast.show("Authentication error", Toast.LONG)
                }
            } else {
                Toast.show("Authentication error", Toast.LONG)
            }
            console.log("Google auth error: " + authState.error)
        }
    }

    const validatePassword = () => {
        const regex = /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9]{8,32}$/;
        return regex.test(password)
    }

    const loginAlert = (title: string, text: string) => Alert.alert(
        title,
        text,
        [
            {
                text: 'Нет',
                style: 'cancel',
            },
            {
                text: 'Yes',
                onPress: async () => {
                    if (validatePassword()) {
                        await dispatch(signUpAsyncEmail({email, password})).unwrap()
                        console.log("logged in as: " + auth.currentUser?.uid)
                    } else {
                        Alert.alert('Incorrect password', 'Password must be 8 to 32 characters long, include at minimum 1 capital letter, 1 number and special symbol.');
                    }
                },
            },
        ],
    );

    const signInEmail = async () => {
        setLoadingTitle("Authentication...")
        try {
            const methods = await userExists(email)
            console.log(methods)
            if (methods & AuthMethods.EMAIL) {
                await dispatch(signInAsyncEmail({email, password})).unwrap()
                console.log("logged in as: " + auth.currentUser?.uid)
                return
            } else if (methods & (AuthMethods.APPLE | AuthMethods.GOOGLE)) {
                loginAlert("Could not enter", "It seems you are already logged into with Apple or Google account.\n" +
                    "You can continue and add the provided password to the account\n" +
                    "Do you want to add the password?")
            } else {
                loginAlert("User not found", "User with specified mail not found.\n" +
                    "Do you want to registers with this parameters?")
            }
        } catch (e) {
            if (isFirebaseError(e)) {
                if (e.code == "auth/wrong-password") {
                    Toast.show("Incorrect password", Toast.LONG)
                }
                if (e.code == "auth/invalid-email") {
                    Toast.show("Incorrect email", Toast.LONG)
                }
                if (e.code == "auth/too-many-requests") {
                    Toast.show("Too many requests, try again later", Toast.LONG)
                }
                if (e.code == "auth/network-request-failed") {
                    Toast.show("No internet connection", Toast.LONG)
                }
            }
            console.log("Email auth error: " + e)
        }
    }

    const requestPassRecovery = async () => {
        setLoadingTitle("Sending...")
        try {
            await dispatch(resetPass(recoveryEmail.toLowerCase())).unwrap()
            setForgotPassVisible(false)
            setRecoveryEmail("")
            Toast.show("Letter sent to specified email", Toast.SHORT)
        } catch (e) {
            if (isFirebaseError(e)) {
                if (e.code == "auth/user-not-found") {
                    Toast.show("User not found", Toast.LONG)
                }
                if (e.code == "auth/invalid-email") {
                    Toast.show("Incorrect email address", Toast.LONG)
                }
                if (e.code == "auth/too-many-requests") {
                    Toast.show("Too many attempts, try again later", Toast.LONG)
                }
                if (e.code == "auth/network-request-failed") {
                    Toast.show("No internet connection", Toast.LONG)
                }
            }
            console.log(e)
        }
    }
    
    const validateEmail = (email: string) => {
        
        if (!emailRegex.test(String(email).toLowerCase())) {
            setValidEmail(false)
            return false
        }
        setValidEmail(true)
        return true
    }

    return (
        <View style={styles.container}>

            <Modal isVisible={forgotPassVisible} onBackButtonPress={() => setForgotPassVisible(false)}
                   onBackdropPress={() => setForgotPassVisible(false)}>
                <View style={{
                    alignSelf: "center",
                    justifyContent: "center",
                    backgroundColor: "white",
                    padding: 15,
                    borderRadius: 10,
                    width: "90%"
                }}>
                    <Text style={styles.title}>Your recovery email</Text>
                    <TextInput
                        style={[styles.textInput, {height: textInputHeight}]}
                        placeholder={"Email"}
                        autoCorrect={false}
                        value={recoveryEmail}
                        onChangeText={(text) => setRecoveryEmail(text)}
                    />
                    <ModalButton onPress={requestPassRecovery} text={"Send"} active={emailRegex.test(recoveryEmail.toLowerCase())}/>
                </View>
            </Modal>

            <View style={{
                flex: 1, alignItems: 'center',
                justifyContent: 'center',
                width: "100%"
            }}>

                <Spinner
                    visible={authState.loading}
                    textContent={loadingTitle}
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

                <AuthButton text={"Continue with Email"} onPress={() => {
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
                    style={styles.button}
                    size={GoogleSigninButton.Size.Wide}
                    color={GoogleSigninButton.Color.Light}
                    onPress={signInGoogle}
                />
                <TouchableOpacity activeOpacity={0.7} style={{padding: "4%"}} onPress={() => setForgotPassVisible(true)}>
                    <Text style={styles.forgotPassword}>Forgot password?</Text>
                </TouchableOpacity>
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
    button: {
        width: "70%",
        height: "6%"
    },
    forgotPassword: {
        color: BUTTON_ACTIVE_COLOR,
        fontWeight: "600"
    },
    title: {
        fontWeight: "600",
        fontSize: 18,
        marginVertical: "2%"
    },
    textInput: {
        ...textInput,
        width: "100%",
        height: "5%"
    },
});
