import {DimensionValue, StyleSheet, Text, TextStyle, View, ViewStyle} from "react-native";
import {iconAttach} from "../../../assets/iconAttach";
import React from "react";
import {
    BUTTON_INACTIVE_COLOR,
    PRIMARY_COLOR,
    PRIMARY_COLOR_50,
    PRIMARY_COLOR_80
} from "../../../styles/colors";
import {TouchableOpacity} from "react-native-gesture-handler";
import {SvgXml} from "react-native-svg";


export default function LargeIconButton({onPress, text, containerStyle, textStyle, active = true, icon = iconAttach, width = "100%"}: {
    onPress: (() => void) | undefined,
    text: string,
    containerStyle?: ViewStyle,
    textStyle?: TextStyle,
    active?: boolean,
    icon?: string,
    width?: DimensionValue
}) {

    return <View style={{alignSelf: "center", width: width}}>
        <TouchableOpacity style={[styles.buttonContainer, containerStyle, !active && {backgroundColor: BUTTON_INACTIVE_COLOR}]}
                          onPress={active ? onPress : undefined}
                          activeOpacity={active ? 0.7 : 1}
        >
            <SvgXml xml={icon} style={{marginRight: 20}}/>
            <Text style={[styles.buttonText, textStyle]}>{text}</Text>
        </TouchableOpacity>
    </View>
}

const styles = StyleSheet.create({
    buttonContainer: {
        alignItems: "center",
        alignSelf: "center",
        padding: 8,
        width: "100%",
        paddingHorizontal: "2%",
        borderRadius: 10,
        borderColor: PRIMARY_COLOR_80,
        borderWidth: 2,
        backgroundColor: PRIMARY_COLOR_50,
        flexDirection: "row"
    },
    buttonText: {
        fontWeight: "600",
        fontSize: 16,
        color: PRIMARY_COLOR
    }
});