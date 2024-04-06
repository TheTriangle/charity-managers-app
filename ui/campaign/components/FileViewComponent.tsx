import {DimensionValue, StyleSheet, Text, TextStyle, View, ViewStyle} from "react-native";
import {iconAttach} from "../../../assets/iconAttach";
import React from "react";
import {
    BUTTON_INACTIVE_COLOR,
} from "../../../styles/colors";
import {SvgXml} from "react-native-svg";
import {iconAttachedFile} from "../../../assets/iconAttachedFile";
import {iconTrashCan} from "../../../assets/iconTrashCan";


export default function FileViewComponent({onRemove, text, containerStyle, textStyle, active = true, icon = iconAttach, width = "100%"}: {
    onRemove: (() => void) | undefined,
    text: string,
    containerStyle?: ViewStyle,
    textStyle?: TextStyle,
    active?: boolean,
    icon?: string,
    width?: DimensionValue
}) {

    return <View style={{alignSelf: "center", width: width}}>
        <View style={[styles.buttonContainer, containerStyle, !active && {backgroundColor: BUTTON_INACTIVE_COLOR}]}
        >
            <SvgXml xml={iconAttachedFile} style={{marginRight: 20}}/>
            <Text style={[styles.buttonText, textStyle]}>{text.length > 25 ? text.substring(0, 22) + "..." : text}</Text>
            <SvgXml xml={iconTrashCan} style={{position: "absolute", right: 10}} onPress={onRemove}/>
        </View>
    </View>
}

const styles = StyleSheet.create({
    buttonContainer: {
        alignItems: "center",
        alignSelf: "center",
        // alignContent: "space-around",
        // justifyContent: "center",
        padding: 8,
        width: "100%",
        paddingHorizontal: "2%",
        borderRadius: 10,
        borderColor: "rgba(0,0,0,0.6)",
        borderWidth: 2,
        backgroundColor: "rgba(0,0,0,0.15)",
        flexDirection: "row"
    },
    buttonText: {
        fontWeight: "600",
        fontSize: 16,
        color: "#444444"
    }
});