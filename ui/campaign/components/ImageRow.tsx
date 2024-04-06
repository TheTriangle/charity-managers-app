import {DimensionValue, StyleSheet, View, ViewStyle, Image} from "react-native";
import React from "react";
import {PRIMARY_COLOR, PRIMARY_COLOR_50} from "../../../styles/colors";
import {SvgXml} from "react-native-svg";
import {iconPlus} from "../../../assets/iconPlus";
import {TouchableOpacity, TouchableWithoutFeedback} from "react-native-gesture-handler";
import * as ImagePicker from 'expo-image-picker';
import {iconTrashCan} from "../../../assets/iconTrashCan";


export default function ImageRow({onClick, containerStyle, source, dimen, setSource}: {
    onClick: ((index: number) => void) | undefined,
    containerStyle?: ViewStyle,
    source: string[],
    dimen: DimensionValue,
    setSource: ((arr: string[]) => void)
}) {

    const addToSource = (uri: string, index?: number) => {
        const copy = [...source]
        if (index !== undefined) {
            copy[index] = uri
        } else {
            for (let i = 0; i < 4; i++) {
                if (copy[i] == "") {
                    copy[i] = uri
                    break
                }
            }
        }
        setSource(copy)
    }

    const pickImage = async (index?: number) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [2, 3],
            quality: 1,
        });

        if (!result.canceled) {
            addToSource(result.assets[0].uri, index)
        }
    };

    return <View style={styles.container}>
        {source.map((value, index) => {
            if (value == "") {
                return <TouchableOpacity key={index} style={[styles.imageContainer, {width: dimen, height: dimen}]}
                                         onPress={() => pickImage()} activeOpacity={0.7}>
                    <SvgXml xml={iconPlus}/>
                </TouchableOpacity>
            } else {
                return <TouchableOpacity key={index} style={[styles.imageContainer, {
                    width: dimen,
                    height: dimen,
                    backgroundColor: ""
                }]}
                                         onPress={() => {
                                             console.log("touchable")
                                             pickImage(index)
                                         }} activeOpacity={0.7}>
                    <Image style={{flex: 1, width: "100%"}} source={{uri: value}}/>
                    <TouchableOpacity key={index}
                                      style={[styles.imageContainer, {
                                          width: dimen,
                                          height: dimen,
                                          backgroundColor: ""
                                      }]}
                                      onPress={() => pickImage(index)} activeOpacity={0.7}>
                        <Image style={{flex: 1, width: "100%"}} source={{uri: value}}/>

                        <SvgXml xml={iconTrashCan} style={{position: "absolute", right: 5, top: 5}}
                                onPress={(event) => {
                                    event.stopPropagation()
                                    const copy = [...source]
                                    copy.splice(index, 1)
                                    copy.push("")
                                    setSource(copy)
                                    return
                                }}/>

                    </TouchableOpacity>
                </TouchableOpacity>
            }
        })}
    </View>
}


const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        alignSelf: "center",
        justifyContent: "space-between",
        width: "100%",
        flexDirection: "row"
    },
    imageContainer: {
        borderRadius: 5,
        borderStyle: "dashed",
        borderColor: PRIMARY_COLOR,
        borderWidth: 2,
        backgroundColor: PRIMARY_COLOR_50,
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center"
    },
});