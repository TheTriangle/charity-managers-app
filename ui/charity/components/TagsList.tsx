import {TagModel} from "../../../data/model/TagModel";
import {StyleSheet, Text, View, ViewStyle} from "react-native";
import React from "react";
import {DefaultTheme} from "@react-navigation/native";
import {PRIMARY_COLOR} from "../../../styles/colors";

export default function TagsList({tags, containerStyle, tagContainerStyle, tagTextStyle}: {
    tags: TagModel[],
    containerStyle?: ViewStyle,
    tagContainerStyle?: ViewStyle,
    tagTextStyle?: ViewStyle
}) {

    return <View style={[styles.container, containerStyle]}>
        {tags.map(tag => {
            return <View style={[styles.tagContainer, tagContainerStyle]} key={tag.id}>
                <Text style={[styles.tagText, tagTextStyle]}>{tag.title}</Text>
            </View>
        })}

    </View>
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignContent: "space-between"
    },
    tagContainer: {
        borderRadius: 100,
        paddingVertical: 2,
        paddingHorizontal: 10,
        marginRight: 10,
        marginBottom: 10,
        backgroundColor: DefaultTheme.colors.background,
        borderColor: PRIMARY_COLOR,
        borderWidth: 1
    },
    tagText: {
        color: PRIMARY_COLOR
    }
})