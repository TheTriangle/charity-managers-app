import {
    Alert,
    StyleSheet,
    View,
} from "react-native";
import React, {useEffect} from "react";
import {CharityProps} from "../../../Navigate";
import TitleCard from "../components/TitleCard";
import Button from "../../utils/Button";
import {useNavigation} from "@react-navigation/native";
import {useSelector} from "react-redux";
import {selectCampaignsState, selectCharitiesState} from "../../../redux/selectors";
import CampaignListItem from "../../campaign/components/CampaignListItem";
import {FlatList, RefreshControl} from "react-native-gesture-handler";
import {useAppDispatch} from "../../../hooks";
import {clearCampaigns, getCampaigns} from "../../../redux/slices/campaignsSlice";
import Toast from "react-native-simple-toast";
import Spinner from "react-native-loading-spinner-overlay";
import {requestDeletion} from "../../../redux/slices/charitiesSlice";

export default function CharityScreen({route: {params: {charityID}}}: CharityProps) {

    const nav = useNavigation<any>()
    const state = useSelector(selectCharitiesState)
    const campaignsState = useSelector(selectCampaignsState)
    const charity = state.confirmedCharities.find(charity => charity.id == charityID)!!
    const dispatch = useAppDispatch()
    const onEditClick = () => {
        nav.navigate("CharityEdit", {charityID: charityID, id: charityID})
    }

    const fetchCampaigns = async () => {
        try {
            await dispatch(getCampaigns({charityID})).unwrap()
        } catch (e) {
            Toast.show("Could not load campaign data", Toast.LONG)
        }
    }

    const requestDelete = async () => {
        try {
            await dispatch(requestDeletion(charityID)).unwrap()
            Toast.show("Request successfully created", Toast.LONG)
            nav.pop()
        } catch (e) {
            Toast.show("Could not create deletion request", Toast.LONG)
        }
    }

    const onDelete = async () => {
        if (charity.requestedDeletion) {
            Alert.alert('Deletion', 'You have already left a deletion request', [
                {text: 'Ok'},
            ]);
            return
        }
        Alert.alert('Deletion', 'A deletion request will be created and sent to moderation.\n' +
            'After the request is created, users will not be able to contribute to organisations campaigns\n' +
            'Continue?', [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {text: 'Yes', onPress: () => requestDelete()},
        ]);
    }

    const onStats = () => {
        nav.navigate("Statistics", {id: charityID, isCampaign: false})
    }

    useEffect(() => {
        fetchCampaigns()
        return () => {
            dispatch(clearCampaigns())
        }
    }, []);


    return <View style={styles.container}>
        <Spinner
            visible={state.deletionLoading}
            textContent={'Deletion request...'}
            textStyle={{color: "white"}}
        />
        <TitleCard containerStyle={{marginBottom: 20}} title={charity.name} desc={charity.description}
                   tags={charity.tags} options={["Edit", "Delete", "Statistics", "Cancel"]}
                   actions={[onEditClick, onDelete, onStats]}/>

        {!campaignsState.loading && campaignsState.campaigns.length == 0 ?
            !charity.requestedDeletion && <Button
                onPress={campaignsState.error == null ? () => nav.navigate("CreateCampaign", {charityID: charityID}) : fetchCampaigns}
                text={campaignsState.error == null ? "Create a campaign" : "Try again"}/> :
            <FlatList contentContainerStyle={{padding: 1.5, paddingBottom: 70}} style={{width: "100%"}}
                      data={campaignsState.campaigns}
                      renderItem={({item}) => {
                          return <CampaignListItem campaign={item} onPress={() => {
                              nav.navigate("Campaign", {campaign: item, charityName: charity.name})
                          }} onEditClick={() => {
                              nav.navigate("UpdateCampaign", {campaign: item})
                          }} onRemoveClick={() => {
                              nav.navigate("FinishCampaign", {campaign: item,})
                          }}
                          />
                      }} ItemSeparatorComponent={() => <View style={{height: 10}}/>}

                      refreshControl={<RefreshControl
                          colors={["#9Bd35A", "#689F38"]}
                          refreshing={campaignsState.loading}
                          onRefresh={fetchCampaigns}/>}
            />
        }
        {campaignsState.campaigns.length > 0 && !charity.requestedDeletion &&
            <View style={{position: "absolute", alignSelf: "center", bottom: 20, opacity: 0.7}}>
                <Button
                    onPress={() => nav.navigate("CreateCampaign", {charityID: charityID})} text={"Create a campaign"}/>
            </View>
        }
    </View>

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: "4%",
    },
})