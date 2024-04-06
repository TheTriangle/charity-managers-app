import {BUTTON_ACTIVE_COLOR, BUTTON_INACTIVE_COLOR} from "../../styles/colors";
import {Pressable, StyleSheet, Text, TextStyle, View, ViewStyle} from "react-native";
import React from "react";
import {TouchableOpacity} from "react-native-gesture-handler";

export default function Button({onPress, text, containerStyle, textStyle, active = true}: {
    onPress: (() => void) | undefined,
    text: string,
    containerStyle?: ViewStyle,
    textStyle?: TextStyle,
    active?: boolean
}) {
    return <View style={{alignSelf: "center"}}>
        <TouchableOpacity style={[styles.buttonContainer, containerStyle, !active && {backgroundColor: BUTTON_INACTIVE_COLOR}]}
                          onPress={active ? onPress : undefined}
                          activeOpacity={active ? 0.7 : 1}
        >
            <Text style={[styles.buttonText, textStyle]}>{text}</Text>
        </TouchableOpacity>
    </View>

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