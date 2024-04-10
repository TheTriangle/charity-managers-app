import {CampaignProps} from "../../../Navigate";
import {useNavigation} from "@react-navigation/native";
import {useSelector} from "react-redux";
import {selectPostsState} from "../../../redux/selectors";
import {useAppDispatch} from "../../../hooks";
import React, {useEffect} from "react";
import {ScrollView, StyleSheet, View} from "react-native";
import PostListItem from "../components/PostListItem";
import Toast from "react-native-simple-toast";
import {getPosts} from "../../../redux/slices/postsSlice";
import PinnedPost from "../components/PinnedPost";
import {RefreshControl} from "react-native-gesture-handler";

export default function CampaignScreen({route: {params: {campaign, charityName}}}: CampaignProps) {

    const nav = useNavigation<any>()
    const postsState = useSelector(selectPostsState)
    const dispatch = useAppDispatch()

    const fetchPosts = async () => {
        try {
            await dispatch(getPosts({campaignID: campaign.id!!})).unwrap()
        } catch (e) {
            Toast.show("Не удалось загрузить посты", Toast.SHORT)
        }
    }

    useEffect(() => {
        fetchPosts()
    }, []);

    // const pinned = {
    //     id: "qwe",
    //     header: "qwe",
    //     fulltext: "qwe",
    //     pinned: true,
    //     images: ["https://upload.wikimedia.org/wikipedia/commons/1/15/Cat_August_2010-4.jpg", "https://upload.wikimedia.org/wikipedia/commons/1/15/Cat_August_2010-4.jpg"],
    //     date: Timestamp.now(),
    //     likesCount: 2,
    //     commentsCount: 3
    // }

    // const posts: PostRemoteModel[] = [{
    //     id: "qwe",
    //     header: "qwe",
    //     fulltext: "qwe",
    //     pinned: true,
    //     images: ["https://upload.wikimedia.org/wikipedia/commons/1/15/Cat_August_2010-4.jpg", "https://upload.wikimedia.org/wikipedia/commons/1/15/Cat_August_2010-4.jpg"],
    //     date: Timestamp.now(),
    //     likesCount: 2,
    //     commentsCount: 3
    // },
    //     {
    //         id: "qwe",
    //         header: "qwe",
    //         fulltext: "qwe",
    //         pinned: true,
    //         images: ["https://upload.wikimedia.org/wikipedia/commons/1/15/Cat_August_2010-4.jpg", "https://upload.wikimedia.org/wikipedia/commons/1/15/Cat_August_2010-4.jpg"],
    //         date: Timestamp.now(),
    //         likesCount: 2,
    //         commentsCount: 3
    //     },
    //     {
    //         id: "qwe",
    //         header: "qwe",
    //         fulltext: "qwe",
    //         pinned: true,
    //         images: ["https://upload.wikimedia.org/wikipedia/commons/1/15/Cat_August_2010-4.jpg", "https://upload.wikimedia.org/wikipedia/commons/1/15/Cat_August_2010-4.jpg"],
    //         date: Timestamp.now(),
    //         likesCount: 2,
    //         commentsCount: 3
    //     }
    // ]



    // // TODO: Получать посты с сервера
    return <View style={styles.container}>
        <ScrollView style={{width: "100%"}} contentContainerStyle={{padding: "4%"}} refreshControl={<RefreshControl
                colors={["#9Bd35A", "#689F38"]}
                refreshing={postsState.loading}
                onRefresh={fetchPosts}/>}>
            {!postsState.loading && postsState.error == null && postsState.pinnedPost !== null && <PinnedPost postModel={postsState.pinnedPost!!} collectedAmount={campaign.collectedamount} requiredAmount={campaign.totalamount} charityName={charityName}
                         options={[]} actions={[]} onCommentsClick={undefined} containerStyle={{marginVertical: "1%"}}/>}
            {postsState.pinnedPost !== null &&
            postsState.posts.map((value, index) => {
                return  <PostListItem key={index} postModel={value} options={[]} onCommentsClick={undefined}
                                                  actions={[]} containerStyle={{marginVertical: "2%"}}/>
        })}

        </ScrollView>
    </View>

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
})