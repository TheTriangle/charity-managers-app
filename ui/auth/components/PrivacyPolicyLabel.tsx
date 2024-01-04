import {Linking, Text} from "react-native";
import React from "react";


export default function PrivacyPolicyLabel() {
    return <Text style={{
        color: "grey",
        width: "80%",
        textAlign: "center",
        fontSize: 10,
        bottom: 10
    }}>
        Продолжая, вы соглашаетесь с <Text
        style={{color: 'grey', textDecorationLine: "underline"}}
        onPress={() => {
            Linking.openURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley')
        }}
    >
        Условиями использования
    </Text> и <Text
        style={{color: 'grey', textDecorationLine: "underline"}}
        onPress={() => {
            Linking.openURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley')
        }}
    >
        Политикой конфиденциальности
    </Text>
    </Text>
}