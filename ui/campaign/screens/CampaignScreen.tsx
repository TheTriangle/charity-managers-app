import {CampaignProps} from "../../../Navigate";
import {useNavigation} from "@react-navigation/native";
import {useSelector} from "react-redux";
import {selectPostsState} from "../../../redux/selectors";
import {useAppDispatch} from "../../../hooks";
import React, {useEffect} from "react";
import {ScrollView, StyleSheet, View} from "react-native";
import PostListItem from "../components/PostListItem";
import Toast from "react-native-simple-toast";
import {clearPosts, getPosts} from "../../../redux/slices/postsSlice";
import PinnedPost from "../components/PinnedPost";
import {RefreshControl} from "react-native-gesture-handler";
import Button from "../../utils/Button";
import {PRIMARY_COLOR} from "../../../styles/colors";

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
        return () => {
            dispatch(clearPosts())
        }
    }, []);

    const onStats = () => {
        nav.navigate("Statistics", {id: campaign.id!!, isCampaign: true})
    }

    return <View style={styles.container}>
        <ScrollView style={{width: "100%"}} contentContainerStyle={{padding: "4%", paddingBottom: 70}} refreshControl={<RefreshControl
                colors={["#9Bd35A", "#689F38"]}
                refreshing={postsState.loading}
                onRefresh={fetchPosts}/>}>
            {!postsState.loading && postsState.error == null && postsState.pinnedPost !== null && <PinnedPost postModel={postsState.pinnedPost!!} collectedAmount={campaign.collectedamount} requiredAmount={campaign.totalamount} charityName={charityName}
                         options={["Статистика", "Отмена"]} actions={[onStats]} onCommentsClick={() => {nav.navigate("Comments", {post: postsState.pinnedPost, campaignID: campaign.id!!, charityName: charityName})}} containerStyle={{marginVertical: "1%"}}/>}
            {postsState.pinnedPost !== null &&
            postsState.posts.map((value, index) => {
                return  <PostListItem key={index} postModel={value} options={[]} onCommentsClick={() => {nav.navigate("Comments", {post: value, campaignID: campaign.id!!, charityName: charityName})}}
                                                  actions={[]} containerStyle={{marginVertical: "2%"}}/>
        })}

        </ScrollView>
        {(campaign.closed == undefined || !campaign.closed) && !postsState.loading && <View style={{position: "absolute", alignSelf: "center", bottom: 20, opacity: 0.8}}>
            <Button containerStyle={{backgroundColor: PRIMARY_COLOR}}
                    onPress={() => nav.navigate("CreatePost", {campaignID: campaign.id!!})} text={"Добавить пост"}/>
        </View>}

    </View>

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
})