import {StyleSheet, ViewStyle, TextStyle, Text, Pressable} from "react-native";
import {PRIMARY_COLOR} from "../../../styles/colors";


export default function AuthButton({text, onPress, containerStyle, textStyle}: {
    text: string,
    onPress?: () => void,
    containerStyle?: ViewStyle
    textStyle?: TextStyle,
}) {
    return <Pressable style={[styles.container, containerStyle]} onPress={onPress}>
        <Text style={[styles.text, textStyle]}>{text}</Text>
    </Pressable>
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 5,
        alignItems: "center",
        width: "68%",
        padding: 9,
        backgroundColor: PRIMARY_COLOR,
        marginVertical: 4
    },
    text: {
        color: "white",
        fontWeight: "600"
    }
})