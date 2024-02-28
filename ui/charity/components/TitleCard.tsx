import {StyleSheet, Text, View, ViewStyle} from "react-native";
import React from "react";
import {TagModel} from "../../../data/model/TagModel";
import TagsList from "./TagsList";
// @ts-ignore
import OptionsMenu from "react-native-option-menu";
import {SvgXml} from "react-native-svg";
import {iconDots} from "../../../assets/iconDots";


export default function TitleCard({title, desc, tags, containerStyle, options, actions}: { title: string, desc: string, tags: TagModel[], options: string[], actions: (() => void)[], containerStyle?: ViewStyle }) {


    return <View style={[styles.container, containerStyle]}>
        <View style={{ position: "absolute", right: 0, marginTop: 10}}>
            <OptionsMenu
                customButton={<SvgXml xml={iconDots}/>}
                destructiveIndex={1}
                options={options}
                actions={actions}/>
        </View>

        <View style={styles.headerContainer}>
            <Text style={styles.header}>{title}</Text>
        </View>
        <Text style={{marginBottom: "2%"}}>{desc.length >= 300 ? desc.substring(0, 200) + "..." : desc.length}</Text>
        <TagsList tags={tags} tagContainerStyle={{backgroundColor: "white"}} containerStyle={{alignSelf: "center"}}/>
    </View>

}

const styles = StyleSheet.create({
    container: {
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: "4%",
        paddingBottom: 0,
        backgroundColor: "white",
        borderRadius: 10,
        shadowRadius: 3,
        shadowOffset: {width: 3, height: 3},
        shadowColor: "black",
        shadowOpacity: 0.5,
        elevation: 3,
    },
    headerContainer: {
        flexDirection: "row",
        marginBottom: "2%"
    },
    header: {
        alignSelf: "center",
        width: "100%",
        fontWeight: "700",
        fontSize: 32,
        textAlign: "center"
    }
})
