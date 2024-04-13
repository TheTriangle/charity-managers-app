import {
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import React, {useState} from "react";
import { textInput} from "../../../styles/styles";

import {useSelector} from "react-redux";
import {selectPostsState} from "../../../redux/selectors";

import {PRIMARY_COLOR, PRIMARY_COLOR_60} from "../../../styles/colors";
import {useNavigation} from "@react-navigation/native";
import Button from "../../utils/Button";
import {useSafeAreaFrame} from "react-native-safe-area-context";
import {useAppDispatch} from "../../../hooks";
import Spinner from "react-native-loading-spinner-overlay";
import {PostCreationProps} from "../../../Navigate";
import Toast from "react-native-simple-toast";
import * as DocumentPicker from 'expo-document-picker';
import LargeIconButton from "../components/LargeIconButton";
import FileViewComponent from "../components/FileViewComponent";
import ImageRow from "../components/ImageRow";
import {PostLocalModel} from "../../../data/model/PostLocalModel";
import firebase from "firebase/compat";
import FieldValue = firebase.firestore.FieldValue;
import {createPost} from "../../../redux/slices/postsSlice";


export default function PostCreationScreen({route: {params: {campaignID}}}: PostCreationProps) {
    const state = useSelector(selectPostsState)

    const [fullDesc, setFullDesc] = useState<string>("")
    const [title, setTitle] = useState("")
    const [images, setImages] = useState(["", "", "", ""])
    const [files, setFiles] = useState<{uri: string, name: string}[]>([])

    const screenHeight = useSafeAreaFrame().height;

    const dispatch = useAppDispatch()
    const nav = useNavigation<any>()


    const reqCreatePost = async () => {
            const post: PostLocalModel = {
                pinned: false,
                header: title,
                fulltext: fullDesc,
                date: FieldValue.serverTimestamp(),
                likesCount: 0,
                commentsCount: 0
            }

            files.length !== 0 ? (post.documents = files) : post.documents = []
            const filteredImages = images.filter(value => value !== "")
            filteredImages.length !== 0 ? (post.images = filteredImages) : post.images = []


        try {
            await dispatch(createPost({post: post, campaignID: campaignID})).unwrap()
            nav.pop()
        } catch (e) {
            Toast.show("Ошибка при создании поста", Toast.SHORT)
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

    return <>
        <Spinner
            visible={state.createLoading}
            textContent={'Публикация...'}
            textStyle={{color: "white"}}
        />

        <View style={styles.container}>

            <Text style={[styles.header, {marginVertical: "1%", alignSelf: "center"}]}>Создать пост</Text>
            <Text style={[styles.title, {marginVertical: "1%"}]}>Название</Text>

            <TextInput
                style={{...styles.textInput, height: "5%"}}
                placeholder={"Название"}
                autoCorrect={false}
                onChangeText={(text) => setTitle(text)}
            />

            <Text style={[styles.title, {marginVertical: "1%"}]}>Описание</Text>

            <TextInput multiline={true}
                       style={[styles.textInput, {
                           height: "30%",
                           textAlignVertical: "top",
                           paddingTop: 2,
                           marginVertical: "1%"
                       }]}

                       onChangeText={(text) => setFullDesc(text)}
                       placeholder={"Описание"}/>
            <Text style={[styles.title, {marginVertical: "1%"}]}>Прикрепите вложения</Text>

            <ImageRow onClick={undefined} source={images} setSource={(newImages) => {
                setImages(newImages)
            }} dimen={screenHeight * 0.10}/>

            {files.length < 2 &&
                <LargeIconButton containerStyle={{height: screenHeight * 0.06, marginVertical: "2%"}}
                                 onPress={selectFiles} text={"Добавить документ"}/>}

            {files.map((value, index) => {
                return <FileViewComponent key={index} containerStyle={{height: screenHeight * 0.06, marginVertical: "1%"}}
                                          onRemove={() => {
                                              const copy = [...files]
                                              copy.splice(index, 1)
                                              setFiles(copy )
                                          }} text={value.name}/>

            })}


        </View>
        <Button containerStyle={{marginVertical: "1%", backgroundColor: PRIMARY_COLOR, bottom: "2%"}} inactiveColor={PRIMARY_COLOR_60} onPress={reqCreatePost} text={"Опубликовать"}
                active={formValid()}
        />
    </>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: "4%",
        height: "100%"
    },
    header: {
        fontWeight: "600",
        fontSize: 24,
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
    }
})