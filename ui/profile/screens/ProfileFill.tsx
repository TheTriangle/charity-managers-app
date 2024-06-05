import {KeyboardAvoidingView, StyleSheet, Text, TextInput, View} from 'react-native';
import React, {useState} from "react";
import {BUTTON_ACTIVE_COLOR} from "../../../styles/colors";
import ButtonRow from "../components/ButtonRow";
import {textInput} from "../../../styles/styles";
import TextInputMask from "react-native-text-input-mask";
import {useAppDispatch} from "../../../hooks";
import {updateManagerInfo} from "../../../redux/slices/profileSlice";
import Spinner from "react-native-loading-spinner-overlay";
import {selectProfileState} from "../../../redux/selectors";
import {useSelector} from "react-redux";
import Toast from "react-native-simple-toast";
import Button from "../../utils/Button";


export default function ProfileFill() {
    const dispatch = useAppDispatch();
    const profileState = useSelector(selectProfileState)
    const [selectedOptions, setSelectedOptions] = useState<number[]>([])
    const [name, setName] = useState<string>("")
    const [phone, setPhone] = useState<string>("")
    const [social, setSocial] = useState<string>("")
    const [description, setDescription] = useState<string>("")

    const options = [{id: 1, title: "Personal fundraising"}, {id: 2, title: "Represent a registered organisation"}]

    const fillProfile = async () => {
        try {
            await dispatch(updateManagerInfo({
                aim: selectedOptions.map(id => options[id - 1].title),
                managerName: name,
                phone: phone,
                ...(social.trim() !== "" && {social: social}),
                ...(description.trim() !== "" && {managerDescription: description}),
            })).unwrap()
        } catch (e) {
            // @ts-ignore
            if (e.message == "No internet connection") {
                Toast.show("No internet connection", Toast.LONG)
            } else {
                Toast.show("Error loading data", Toast.LONG)
            }
        }
    }

    const handleButtonPress = (buttonId: number) => {
        if (selectedOptions.includes(buttonId)) {
            setSelectedOptions(selectedOptions.filter((id) => id !== buttonId));
        } else {
            setSelectedOptions([...selectedOptions, buttonId]);
        }
    };


    const infoFilled = () => name.length != 0 && phone.length == 11 && selectedOptions.length != 0

    return (
        <View style={styles.container}>
            <Spinner
                visible={profileState.loading}
                textContent={'Loading...'}
                textStyle={{color: "white"}}
            />
            <KeyboardAvoidingView
                style={{width: "100%"}}
                behavior={"position"}>

                <Text style={styles.header}>Your information</Text>
                <Text style={styles.title}>What will you use the app for</Text>
                <ButtonRow data={options} onPress={handleButtonPress} selected={selectedOptions}/>
                <Text style={styles.title}>Personal information</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder={"Your first and last name"}
                    autoCorrect={false}
                    onChangeText={(text) => setName(text)}
                />
                <TextInputMask
                    style={styles.textInput}
                    placeholder={"Contact number"}
                    onChangeText={(formatted, extracted) => setPhone(extracted ? "7" + extracted : "")}
                    mask={"+7 ([000]) [000]-[00]-[00]"}
                    inputMode={"tel"}
                />
                <TextInput
                    style={styles.textInput}
                    placeholder={"Social networks (optional)"}
                    autoCorrect={false}
                    onChangeText={(text) => setSocial(text)}
                />
                <Text style={styles.title}>Additional</Text>
                <TextInput multiline={true}
                           numberOfLines={15}
                           style={[styles.textInput, {
                               height: "40%", textAlignVertical: "top", paddingTop: 2
                           }]}
                           maxLength={1500}
                           onChangeText={(text) => setDescription(text)}
                           placeholder={"What kind of fundraising campaigns are you planning to create (represented charities, kind of work etc)"}/>

            </KeyboardAvoidingView>

            <Button text={"Done"} onPress={fillProfile} active={infoFilled()}/>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: "4%"
    },
    header: {
        fontWeight: "600",
        fontSize: 24
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
    buttonContainer: {
        alignItems: "center",
        alignSelf: "center",
        padding: 8,
        paddingHorizontal: "20%",
        borderRadius: 100,
        backgroundColor: BUTTON_ACTIVE_COLOR
    },
    buttonText: {
        fontWeight: "600",
        fontSize: 20,
        color: "white"
    }
});
