import {BUTTON_ACTIVE_COLOR, BUTTON_INACTIVE_COLOR} from "../../styles/colors";
import {Pressable, StyleSheet, Text, TextStyle, ViewStyle} from "react-native";
import React from "react";
import {textInput} from "../../styles/styles";

export default function Button({onPress, text, containerStyle, textStyle}: {
    onPress: (() => void) | undefined,
    text: string,
    containerStyle?: ViewStyle,
    textStyle?: TextStyle
}) {
    return <Pressable style={[styles.buttonContainer, containerStyle]}
                      onPress={onPress}
    >
        <Text style={[styles.buttonText, textStyle]}>{text}</Text>
    </Pressable>
}

const styles = StyleSheet.create({
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