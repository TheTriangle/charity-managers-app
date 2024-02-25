import {
    StyleSheet,
    View,
} from "react-native";
import React from "react";

import {CharityProps} from "../../../Navigate";
import TitleCard from "../components/TitleCard";

export default function CharityScreen({route: {params: {charity}}}: CharityProps) {


    return <View style={styles.container}>
        <TitleCard title={charity.name} desc={charity.description} tags={charity.tags}/>
        <TitleCard containerStyle={{marginBottom: 20}} title={charity.name} desc={charity.description} tags={charity.tags}/>
    </View>

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: "4%",
    },
})