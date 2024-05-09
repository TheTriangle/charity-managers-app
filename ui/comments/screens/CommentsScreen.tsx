import {CommentsProps} from "../../../Navigate";
import {useSelector} from "react-redux";
import {selectCommentsState} from "../../../redux/selectors";
import {useAppDispatch} from "../../../hooks";
import React, {useEffect, useRef, useState} from "react";
import {FlatList, Keyboard, StyleSheet, TextInput, View} from "react-native";
import Toast from "react-native-simple-toast";
import {auth} from "../../../firebase/config";
import {clearComments, createComment, getComments} from "../../../redux/slices/commentsSlice";
import CommentItem from "../components/Comment";
import PostListItem from "../../campaign/components/PostListItem";
import {KeyboardStickyView} from "react-native-keyboard-controller";
import {useSafeAreaFrame} from "react-native-safe-area-context";
import {textInput} from "../../../styles/styles";
import {SvgXml} from "react-native-svg";
import {iconSend} from "../../../assets/iconSend";
import firebase from "firebase/compat";
import FieldValue = firebase.firestore.FieldValue;

export default function CommentsScreen({route: {params: {post, campaignID, charityName}}}: CommentsProps) {

    const [comment, setComment] = useState("")
    const [currentPost, setCurrentPost] = useState(post)

    const state = useSelector(selectCommentsState)
    const dispatch = useAppDispatch()
    const screenHeight = useSafeAreaFrame().height;
    const textInputHeight = screenHeight * 0.05
    const ref = useRef<TextInput>(null)


    const fetchComments = async () => {
        try {
            await dispatch(getComments({postID: post.id, campaignID: campaignID})).unwrap()
        } catch (e) {
            console.log(e)
            Toast.show("Не удалось загрузить комментарии", Toast.SHORT)
        }
    }

    const postComment = async () => {
        if (comment.length == 0) {
            return
        }
        try {
            Keyboard.dismiss()
            await dispatch(createComment({
                campaignID: campaignID,
                postID: post.id,
                comment: {
                    text: comment,
                    uid: auth.currentUser!!.uid,
                    date: FieldValue.serverTimestamp(),
                    username: charityName,
                    organization: true
                }
            })).unwrap()
            setComment("")
            ref.current?.clear()
            setCurrentPost((prevState) => {
                return {...prevState, commentsCount: prevState.commentsCount + 1}
            })
        } catch (e) {
            console.log(e)
            Toast.show("Не удалось оставить комментарий", Toast.LONG)
        }
    }

    useEffect(() => {
        fetchComments()
        return () => {
            dispatch(clearComments())
        }
    }, []);

    return <View style={styles.container}>
        <FlatList data={state.comments}
                  ListHeaderComponent={
                      <PostListItem onCommentsClick={undefined} options={[]} actions={[]} postModel={currentPost}/>
                  }
                  renderItem={({item}) => {
                      return <CommentItem username={item.username} content={item.text} date={item.date as string}/>
                  }}
                  refreshing={state.loading}
                  onRefresh={fetchComments}
                  contentContainerStyle={{padding: "4%", paddingBottom: 70}}
        />

        <KeyboardStickyView style={styles.inputFooter}>
            <TextInput
                ref={ref}
                multiline={true}
                maxLength={700}
                style={{...textInput, height: textInputHeight, flex: 1}}
                placeholder={"Добавить комментарий"}
                onChangeText={(text) => setComment(text)}
            />
            <SvgXml xml={iconSend} style={{marginLeft: 10}} onPress={postComment}/>

        </KeyboardStickyView>

    </View>

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    inputFooter: {
        position: "absolute",
        bottom: 0,
        flexDirection: "row",
        borderRadius: 10,
        shadowRadius: 3,
        shadowOffset: {width: 3, height: 3},
        shadowColor: "black",
        shadowOpacity: 0.5,
        elevation: 3,
        // minHeight: 100,
        width: "92%",
        padding: 6,
        backgroundColor: "white",
        alignItems: "center"
    }
})