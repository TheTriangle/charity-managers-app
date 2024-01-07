import {Pressable, StyleSheet, Text, TextStyle, View, ViewStyle} from "react-native";
import {TagModel} from "../../../data/model/TagModel";
import {PRIMARY_COLOR} from "../../../styles/colors";
import {useState} from "react";


export default function ButtonRow({
                                      data, onPress, buttonContainerStyle, textStyle, selected, containerStyle
                                  }:
                                      {
                                          data: TagModel[],
                                          onPress: (id: number) => void,
                                          selected: number[],
                                          containerStyle?: ViewStyle,
                                          buttonContainerStyle?: ViewStyle,
                                          textStyle?: TextStyle,
                                      }
) {



    return <View style={[styles.container, containerStyle]}>
        {data.map((button) => (
            <Pressable
                key={button.id}
                style={[
                    styles.buttonContainer,
                    buttonContainerStyle,
                    selected.includes(button.id) && {backgroundColor: PRIMARY_COLOR},
                ]}
                onPress={() => onPress(button.id)}>
                <Text
                    style={[
                        styles.buttonText,
                        textStyle,
                        selected.includes(button.id) && {color: "white"}]}>
                    {button.title}
                </Text>
            </Pressable>
        ))}
    </View>
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignSelf: "center",
        justifyContent: 'space-around',
        marginVertical: "2%",
        width: "100%"
    },
    buttonContainer: {
        borderWidth: 1,
        backgroundColor: "white",
        borderColor: PRIMARY_COLOR,
        paddingVertical: 7,
        paddingHorizontal: 13.2,
        borderRadius: 100,
    },
    buttonText: {
        fontWeight: "600",
        fontSize: 16,
        color: PRIMARY_COLOR
    }
})