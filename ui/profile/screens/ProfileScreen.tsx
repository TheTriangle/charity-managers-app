import {StyleSheet, Text, TextInput, View} from 'react-native';
import React, {useState} from "react";
import {useAppDispatch} from "../../../hooks";
import {signOut} from "../../../redux/slices/authSlice";
import Button from "../../utils/Button";
import {PRIMARY_COLOR} from "../../../styles/colors";
import Modal from "react-native-modal/dist/modal";
import {textInput} from "../../../styles/styles";
import {useSafeAreaFrame} from "react-native-safe-area-context";
import Spinner from "react-native-loading-spinner-overlay";
import {useSelector} from "react-redux";
import {selectProfileState} from "../../../redux/selectors";
import Toast from "react-native-simple-toast";
import {createSupportRequest, updateContactsRequest} from "../../../redux/slices/profileSlice";
import ModalButton from "../../utils/ModalButton";
import TextInputMask from "react-native-text-input-mask";


export default function ProfileScreen() {
    const dispatch = useAppDispatch()
    const state = useSelector(selectProfileState)

    const [showContactUs, setShowContactUs] = useState(false)
    const [showChangeContacts, setShowChangeContacts] = useState(false)
    const [contactUsContact, setContactUsContact] = useState<string>("")
    const [contactUsTitle, setContactUsTitle] = useState<string>("")
    const [contactUsText, setContactUsText] = useState<string>("")
    const [loadingTitle, setLoadingTitle] = useState("Создание...")
    const [phone, setPhone] = useState<string>(state.phone)
    const [social, setSocial] = useState<string>(state.social)


    const screenHeight = useSafeAreaFrame().height;
    const textInputHeight = screenHeight * 0.04

    const contactUsValid = contactUsContact.length != 0 && contactUsText.length != 0 && contactUsTitle.length != 0

    const createSupportRequestUI = async () => {
        setLoadingTitle("Создание...")
        try {
            await dispatch(createSupportRequest({
                contact: contactUsContact,
                text: contactUsText,
                title: contactUsTitle
            })).unwrap()
            Toast.show("Обращение успешно создано", Toast.SHORT)
            setShowContactUs(false)
        } catch (e) {
            Toast.show("Не удалось создать обращение", Toast.LONG)
            console.log(e)
        }
    }

    const updateContactsUI = async () => {
        setLoadingTitle("Изменение...")
        try {
            await dispatch(updateContactsRequest({phone: phone, social: social})).unwrap()
            Toast.show("Данные успешно обновлены", Toast.SHORT)
            setShowChangeContacts(false)
        } catch (e) {
            Toast.show("Не удалось обновить данные", Toast.LONG)
            console.log(e)
        }
    }

    const dismissContactUsModal = () => {
        setContactUsText("")
        setContactUsTitle("")
        setContactUsContact("")
        setShowContactUs(false)
    }

    const dismissContactsModal = () => {
        setSocial(state.social)
        setPhone(state.phone)
        setShowChangeContacts(false)
    }

    return (
        <>
            <Spinner
                visible={state.loading}
                textContent={loadingTitle}
                textStyle={{color: "white"}}
            />
            <Modal isVisible={showContactUs} onBackButtonPress={dismissContactUsModal}
                   onBackdropPress={dismissContactUsModal}>
                <View style={{
                    alignSelf: "center",
                    justifyContent: "center",
                    backgroundColor: "white",
                    padding: 15,
                    borderRadius: 10,
                    width: "90%"
                }}>
                    <Text style={styles.title}>Email или контакт для обратной связи</Text>
                    <TextInput
                        style={[styles.textInput, {height: textInputHeight}]}
                        placeholder={"Ваш контакт"}
                        autoCorrect={false}
                        onChangeText={(text) => setContactUsContact(text)}
                    />
                    <Text style={styles.title}>Тема обращения</Text>
                    <TextInput
                        style={[styles.textInput, {height: textInputHeight}]}
                        placeholder={"Тема"}
                        autoCorrect={false}
                        onChangeText={(text) => setContactUsTitle(text)}
                    />
                    <Text style={styles.title}>Текст обращения</Text>
                    <TextInput
                        style={[styles.textInput, {
                            height: textInputHeight * 6,
                            textAlignVertical: "top",
                            paddingTop: 2,
                        }]}
                        placeholder={"Обращение"}
                        autoCorrect={false}
                        multiline={true}
                        onChangeText={(text) => setContactUsText(text)}
                    />
                    <ModalButton onPress={createSupportRequestUI} text={"Отправить"} active={contactUsValid}/>
                </View>
            </Modal>

            <Modal isVisible={showChangeContacts} onBackButtonPress={dismissContactsModal}
                   onBackdropPress={dismissContactsModal}>
                <View style={{
                    alignSelf: "center",
                    justifyContent: "center",
                    backgroundColor: "white",
                    padding: 15,
                    borderRadius: 10,
                    width: "90%"
                }}>
                    <Text style={styles.title}>Контактный телефон</Text>
                    <TextInputMask
                        style={[styles.textInput, {height: textInputHeight}]}
                        placeholder={"Ваш телефон"}
                        value={state.phone}
                        onChangeText={(formatted, extracted) => setPhone(extracted ? "7" + extracted : "")}
                        mask={"+7 ([000]) [000]-[00]-[00]"}
                        inputMode={"tel"}
                    />
                    <Text style={styles.title}>Соцсеть</Text>
                    <TextInput
                        style={[styles.textInput, {height: textInputHeight}]}
                        placeholder={"Соцсеть"}
                        value={social}
                        autoCorrect={false}
                        onChangeText={(text) => setSocial(text)}
                    />
                    <ModalButton onPress={updateContactsUI} text={"Готово"} active={phone.length == 11}/>
                </View>
            </Modal>

            <View style={styles.container}>
                <View style={{flex: 1, marginTop: "5%"}}>
                    <Button containerStyle={styles.actionButton} onPress={() => setShowContactUs(true)}
                            text={"Напишите нам"}/>
                    <Button containerStyle={{...styles.actionButton, paddingHorizontal: "5%"}} onPress={() => setShowChangeContacts(true)}
                            text={"Изменить мои контакты"}/>
                </View>

                <Button containerStyle={{bottom: 10, backgroundColor: PRIMARY_COLOR}}
                        onPress={() => dispatch(signOut())} text={"Выйти"}/>
            </View>
        </>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButton: {
        marginVertical: "2%"
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
