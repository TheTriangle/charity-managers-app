import {StyleSheet, Text, View, ViewStyle, Image, Linking} from 'react-native';
// @ts-ignore
import OptionsMenu from "react-native-option-menu";
import {SvgXml} from "react-native-svg";
import {iconDots} from "../../../assets/iconDots";
import React, {useEffect} from "react";
import {PostRemoteModel} from "../../../data/model/PostLocalModel";
import FileViewComponent from "./FileViewComponent";
import {iconLike} from "../../../assets/iconLike";
import {iconComment} from "../../../assets/iconComment";
import PagerView from 'react-native-pager-view';
import {PRIMARY_COLOR} from "../../../styles/colors";

export default function PinnedPost({postModel, charityName, collectedAmount, requiredAmount, onCommentsClick, containerStyle, options, actions}: {
    postModel: PostRemoteModel,
    collectedAmount: number,
    requiredAmount: number,
    charityName: string,
    options: string[],
    onCommentsClick: (() => void) | undefined,
    actions: (() => void)[],
    containerStyle?: ViewStyle
}) {



    const formatter = new Intl.DateTimeFormat('ru-RU', {day: '2-digit', month: '2-digit', year: 'numeric'});
    const fillPercentage = requiredAmount == 0 ? 0 :
        (collectedAmount > requiredAmount ? 100 : (collectedAmount / requiredAmount) * 100)
    const collected = requiredAmount == 0 ? `Собрано ${collectedAmount}` : `Собрано ${collectedAmount} из ${requiredAmount}`

    useEffect(() => {
        console.log("pinned " + postModel)
    }, []);

    return <View style={[styles.container, containerStyle]}>
        <View style={{position: "absolute", right: 0, marginTop: 10}}>
            <OptionsMenu
                customButton={<SvgXml xml={iconDots}/>}
                destructiveIndex={1}
                options={options}
                actions={actions}/>
        </View>
        <View style={styles.headerContainer}>
            <Text style={styles.header}>{charityName}</Text>
        </View>
        <Text style={[styles.header, {fontSize: 24}]}>{postModel.header}</Text>

        <View style={styles.pressableContainer}>
            <View style={[styles.collectedContainer, {width: `${fillPercentage}%`}]}/>
        </View>

        <Text style={{alignSelf: "center", color: PRIMARY_COLOR, fontSize: 16, fontWeight: "600"}}>{collected}</Text>

        <Text style={{marginBottom: "2%"}}>{postModel.fulltext}</Text>

        {/*TODO: Поменять высоту на адекватную*/}
        {postModel.images && postModel.images.length > 0 && <PagerView style={{width: "100%", height: 300}} initialPage={0}>

            {postModel.images.map((value, index) => {
                return <View key={index} style={{flex: 1}}>
                    <Image source={{uri: value}} style={{flex: 1}} key={index}/>
                </View>
            })}
        </PagerView>}

        <View style={{height: "1%"}}/>

        {postModel.documents && postModel.documents.map((document, index) => (
            <FileViewComponent onRemove={undefined} key={index} text={document.name} onClick={() => Linking.openURL(document.uri)}/>
        ))}

        <View style={{height: "1%"}}/>

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
