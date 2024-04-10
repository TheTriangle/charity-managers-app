import {
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
import {getCampaigns} from "../../../redux/slices/campaignsSlice";
import Toast from "react-native-simple-toast";

export default function CharityScreen({route: {params: {charityID}}}: CharityProps) {

    const nav = useNavigation<any>()
    const state = useSelector(selectCharitiesState)
    const campaignsState = useSelector(selectCampaignsState)
    const charity = state.confirmedCharities.find(charity => charity.id == charityID)!!
    const dispatch = useAppDispatch()
    const onEditClick = () => {
        nav.navigate("CharityEdit", {charityID: charityID})
    }

    const fetchCampaigns = async () => {
        try {
            await dispatch(getCampaigns({charityID})).unwrap()
        } catch (e) {
            Toast.show("Не удалось загузить данные о кампаниях", Toast.LONG)
        }
    }

    useEffect(() => {
        fetchCampaigns()
    }, []);



    return <View style={styles.container}>
        <TitleCard containerStyle={{marginBottom: 20}} title={charity.name} desc={charity.description}
                   tags={charity.tags} options={["Редактировать", "Удалить", "Отмена"]} actions={[onEditClick]}/>

        {!campaignsState.loading && campaignsState.campaigns.length == 0 ?
            <Button onPress={campaignsState.error == null ? () => nav.navigate("CreateCampaign", {charityID: charityID}) : fetchCampaigns} text={campaignsState.error == null ? "Открыть сбор" : "Попробовать снова"}/> :
            <FlatList contentContainerStyle={{padding: 1.5, paddingBottom: 70}} style={{width: "100%"}} data={campaignsState.campaigns}
                      renderItem={({item}) => {
                          return <CampaignListItem campaign={item} onPress={() => {
                              nav.navigate("Campaign", {campaign: item, charityName: charity.name})
                          }} onEditClick={() => {
                          }} onRemoveClick={() => {
                          }}
                          />
                      }} ItemSeparatorComponent={() => <View style={{height: 10}}/>}

                      refreshControl={<RefreshControl
                          colors={["#9Bd35A", "#689F38"]}
                          refreshing={campaignsState.loading}
                          onRefresh={fetchCampaigns}/>}
            />
        }
        {campaignsState.campaigns.length > 0 &&
            <View style={{position: "absolute", alignSelf: "center", bottom: 20, opacity: 0.7}}>
                <Button
                        onPress={() => nav.navigate("CreateCampaign", {charityID: charityID})} text={"Открыть сбор"}/>
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