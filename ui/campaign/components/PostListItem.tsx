import {StyleSheet, Text, View, ViewStyle, Image, Linking} from 'react-native';
import {SvgXml} from "react-native-svg";
import React from "react";
import {PostRemoteModel} from "../../../data/model/PostLocalModel";
import FileViewComponent from "./FileViewComponent";
import {iconLike} from "../../../assets/iconLike";
import {iconComment} from "../../../assets/iconComment";
import PagerView from 'react-native-pager-view';
import {PRIMARY_COLOR} from "../../../styles/colors";
import {useSafeAreaFrame} from "react-native-safe-area-context";

export default function PostListItem({postModel, onCommentsClick, containerStyle, options, actions}: {
    postModel: PostRemoteModel,
    options: string[],
    onCommentsClick: (() => void) | undefined,
    actions: (() => void)[],
    containerStyle?: ViewStyle
}) {
    const screenHeight = useSafeAreaFrame().height;
    const marginVertical = screenHeight * 0.01


    return <View style={[styles.container, containerStyle]}>

        <Text style={[styles.header, {fontSize: 24}]}>{postModel.header}</Text>

        <Text style={{marginBottom: marginVertical * 2}}>{postModel.fulltext}</Text>

        {/*TODO: Поменять высоту на адекватную*/}
        {postModel.images && postModel.images.length > 0 && <PagerView style={{width: "100%", height: 300}} initialPage={0}>

            {postModel.images.map((value, index) => {
                return <View key={index} style={{flex: 1}}>
                    <Image source={{uri: value}} style={{flex: 1}} key={index}/>
                </View>
            })}
        </PagerView>}

        <View style={{height: marginVertical}}/>

        {postModel.documents && postModel.documents.map((document, index) => (
            <FileViewComponent onRemove={undefined} key={index} text={document.name} onClick={() => Linking.openURL(document.uri)}/>
        ))}

        <View style={{height: marginVertical}}/>

        <View style={styles.bottomBar}>
            <View style={styles.iconContainer}>
                <SvgXml xml={iconComment} onPress={onCommentsClick}/>
                <Text style={styles.count}>{postModel.commentsCount}</Text>
            </View>
            <Text style={{color: "grey"}}>{postModel.date}</Text>
            <View style={styles.iconContainer}>
                <SvgXml xml={iconLike}/>
                <Text style={styles.count}>{postModel.likesCount}</Text>
            </View>
        </View>
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
        width: "100%"
    },
    pressableContainer: {
        backgroundColor: "#97C3F3",
        borderRadius: 20,
        padding: 2,
        // flex: 1,
        width: "100%",
        height: 30,
        marginVertical: "1%"
    },
    collectedContainer: {
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 20,
        height: "100%"
        // flex: 1
    },
    page: {
        justifyContent: 'center',
        alignItems: 'center',
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
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: 'lightgray',
        width: "100%"
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    count: {
        marginLeft: 5,
    },
})
