import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import React, {useState} from "react";
import {textInput} from "../../../styles/styles";

import {useSelector} from "react-redux";
import {selectPostsState} from "../../../redux/selectors";

import {PRIMARY_COLOR} from "../../../styles/colors";
import {useNavigation} from "@react-navigation/native";
import Button from "../../utils/Button";
import {useSafeAreaFrame} from "react-native-safe-area-context";
import {useAppDispatch} from "../../../hooks";
import Spinner from "react-native-loading-spinner-overlay";
import {FinishCampaignProps} from "../../../Navigate";
import Toast from "react-native-simple-toast";
import * as DocumentPicker from 'expo-document-picker';
import LargeIconButton from "../components/LargeIconButton";
import FileViewComponent from "../components/FileViewComponent";
import ImageRow from "../components/ImageRow";
import {PostLocalModel} from "../../../data/model/PostLocalModel";
import firebase from "firebase/compat";
import FieldValue = firebase.firestore.FieldValue;
import {finishCampaign} from "../../../redux/slices/postsSlice";
import {Checkbox} from "../../utils/CheckBox";


export default function FinishCampaignScreen({route: {params: {campaign}}}: FinishCampaignProps) {
    const state = useSelector(selectPostsState)

    const [collectedFull, setCollectedFull] = useState(false)
    const [notify, setNotify] = useState(false)

    const [fullDesc, setFullDesc] = useState<string>("")
    const [title, setTitle] = useState("")
    const [images, setImages] = useState(["", "", "", ""])
    const [files, setFiles] = useState<{ uri: string, name: string }[]>([])

    const screenHeight = useSafeAreaFrame().height;
    const textInputHeight = screenHeight * 0.04
    const marginVertical = screenHeight * 0.01

    const fillPercentage = campaign.totalamount == 0 ? 0 :
        (campaign.collectedamount > campaign.totalamount ? 100 : (campaign.collectedamount / campaign.totalamount) * 100)
    const collected = campaign.totalamount == 0 ? `Collected ${campaign.collectedamount}` : `Collected ${campaign.collectedamount} out of ${campaign.totalamount}`


    const dispatch = useAppDispatch()
    const nav = useNavigation<any>()


    const reqCreatePost = async () => {
        const post: PostLocalModel = {
            pinned: false,
            header: title,
            fulltext: fullDesc,
            date: FieldValue.serverTimestamp(),
            likesCount: 0,
            commentsCount: 0,
            finish: true,
            collectedFull: collectedFull,
            notify: notify
        }

        files.length !== 0 ? (post.documents = files) : post.documents = []
        const filteredImages = images.filter(value => value !== "")
        filteredImages.length !== 0 ? (post.images = filteredImages) : post.images = []

        try {
            await dispatch(finishCampaign({post: post, campaignID: campaign.id!!})).unwrap()
            nav.pop()
        } catch (e) {
            Toast.show("Post creation error", Toast.SHORT)
        }
    }

    const formValid = () => {
        return fullDesc.length != 0 &&
            title.length != 0
    }


    const selectFiles = async () => {
        const res = await DocumentPicker.getDocumentAsync({type: 'application/pdf', multiple: false});

        if (!res.canceled) {
            const newFiles = [...files];
            res.assets[0].uri
            newFiles.push({uri: res.assets[0].uri, name: res.assets[0].name})
            setFiles(newFiles);
        }
    }

    return <ScrollView>
        <Spinner
            visible={state.createLoading}
            textContent={'Publication...'}
            textStyle={{color: "white"}}
        />

        <View style={styles.container}>

            <View style={styles.headerContainer}>
                <Text style={styles.header}>{campaign.name}</Text>
            </View>


            <View style={styles.pressableContainer}>
                <View style={[styles.collectedContainer, {width: `${fillPercentage}%`}]}/>
            </View>

            <Text style={{alignSelf: "center", color: PRIMARY_COLOR, fontSize: 16, fontWeight: "600"}}>{collected}</Text>

            <Pressable style={{flexDirection: "row", flex: 1, alignItems: "center", marginVertical: marginVertical}} onPress={() => {setCollectedFull(prev => !prev)}}>
                <Checkbox onChange={() => {setCollectedFull(prev => !prev)}} checked={collectedFull}/>
                <Text style={{marginLeft: 10}} >Collected succesfully</Text>
            </Pressable>

            <Pressable style={{flexDirection: "row", flex: 1, alignItems: "center", marginVertical: marginVertical}} onPress={() => {setNotify(prev => !prev)}}>
                <Checkbox onChange={() => {setNotify(prev => !prev)}} checked={notify}/>
                <Text style={{marginLeft: 10}} >Notify donors</Text>
            </Pressable>


            <Text style={[styles.header, {marginVertical: marginVertical, alignSelf: "center"}]}>Finishing post</Text>
            <Text style={[styles.title, {marginVertical: marginVertical}]}>Name</Text>

            <TextInput
                style={{...styles.textInput, height: textInputHeight}}
                placeholder={"Name"}
                autoCorrect={false}
                maxLength={70}
                onChangeText={(text) => setTitle(text)}
            />

            <Text style={[styles.title, {marginVertical: marginVertical}]}>Description</Text>

            <TextInput multiline={true}
                       style={[styles.textInput, {
                           height: screenHeight * 0.22,
                           textAlignVertical: "top",
                           paddingTop: 2,
                           marginVertical: marginVertical
                       }]}

                       onChangeText={(text) => setFullDesc(text)}
                       placeholder={"Description"}/>
            <Text style={[styles.title, {marginVertical: marginVertical}]}>Add attachments</Text>

            <ImageRow onClick={undefined} source={images} setSource={(newImages) => {
                setImages(newImages)
            }} dimen={screenHeight * 0.10}/>

            {files.length < 2 &&
                <LargeIconButton containerStyle={{height: screenHeight * 0.06, marginVertical: marginVertical * 2}}
                                 onPress={selectFiles} text={"Add document"}/>}

            {files.map((value, index) => {
                return <FileViewComponent key={index}
                                          containerStyle={{height: screenHeight * 0.06, marginVertical: marginVertical}}
                                          onRemove={() => {
                                              const copy = [...files]
                                              copy.splice(index, 1)
                                              setFiles(copy)
                                          }} text={value.name}/>

            })}


        </View>
        <Button containerStyle={{marginVertical: marginVertical, backgroundColor: "#CC1D00", bottom: marginVertical * 2}}
                inactiveColor={"rgba(204,29,0,0.6)"} onPress={reqCreatePost} text={"Close campaign"}
                active={formValid()}
        />
    </ScrollView>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: "4%",
    },
    title: {
        fontWeight: "600",
        fontSize: 18,
        marginVertical: "2%"
    },
    textInput: {
        ...textInput,
        width: "100%",
        height: "3.5%"
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
        fontSize: 24,
        textAlign: "center"
    },
})