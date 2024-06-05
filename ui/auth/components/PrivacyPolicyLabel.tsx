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
        By continuing, you agree to с <Text
        style={{color: 'grey', textDecorationLine: "underline"}}
        onPress={() => {
            Linking.openURL('https://fukenrice.github.io/charity-managers-app/')
        }}
    >
        Confidentiality policy
    </Text>
    </Text>
}