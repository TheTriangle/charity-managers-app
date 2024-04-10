import {DimensionValue, Pressable, StyleSheet, Text, TextStyle, View, ViewStyle} from "react-native";
import {iconAttach} from "../../../assets/iconAttach";
import React from "react";
import {SvgXml} from "react-native-svg";
import {iconAttachedFile} from "../../../assets/iconAttachedFile";
import {iconTrashCan} from "../../../assets/iconTrashCan";


export default function FileViewComponent({onRemove, text, containerStyle, textStyle, onClick, icon = iconAttach, width = "100%"}: {
    onRemove: (() => void) | undefined,
    text: string,
    onClick?: (() => void) | undefined,
    containerStyle?: ViewStyle,
    textStyle?: TextStyle,
    icon?: string,
    width?: DimensionValue
}) {

    return <View style={{alignSelf: "center", width: width}}>
        <Pressable style={[styles.buttonContainer, containerStyle]}  onPress={onClick ? () => onClick() : undefined}
        >
            <SvgXml xml={iconAttachedFile} style={{marginRight: 20}}/>
            <Text style={[styles.buttonText, textStyle]}>{text.length > 25 ? text.substring(0, 22) + "..." : text}</Text>
            {onRemove !== undefined && <SvgXml xml={iconTrashCan} style={{position: "absolute", right: 10}} onPress={onRemove}/>}
        </Pressable>
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