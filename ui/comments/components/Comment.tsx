import {StyleSheet, Text, TextStyle, View, ViewStyle} from "react-native";

export default function CommentItem({username, content, date, containerStyle, textStyle}: {
    username: string,
    content: string,
    date: string,
    containerStyle?: ViewStyle
    textStyle?: TextStyle,
}) {
    return <View style={[styles.container, containerStyle]}>
        <View style={{flexDirection: "row", justifyContent: "space-between", flex: 1, width: "100%"}}>
            <Text style={{fontWeight: "500"}}>{username.length >= 30 ? username.substring(0,30) + "..." : username}</Text>
            <Text style={{color: "grey"}}>{date}</Text>
        </View>

        <Text style={[styles.text, textStyle]}>{content}</Text>
    </View>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 10,
        alignItems: "center",
        width: "100%",
        padding: 9,
        backgroundColor: "white",
        marginVertical: 4,
        shadowRadius: 3,
        shadowOffset: {width: 3, height: 3},
        shadowColor: "black",
        shadowOpacity: 0.5,
        elevation: 3,
    },
    text: {
        alignSelf: "flex-start"
    }
})