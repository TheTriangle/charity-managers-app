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
            Toast.show("Не удалось загузить данные о кампаниях", Toast.LONG)
        }
    }

    const requestDelete = async () => {
        try {
            await dispatch(requestDeletion(charityID)).unwrap()
            Toast.show("Заявка на удаление успешно создана", Toast.LONG)
            nav.pop()
        } catch (e) {
            Toast.show("Не удалось оставить заявку на удаление", Toast.LONG)
        }
    }

    const onDelete = async () => {
        if (charity.requestedDeletion) {
            Alert.alert('Удаление', 'Вы уже оставили заявку на удаление', [
                {text: 'Ок'},
            ]);
            return
        }
        Alert.alert('Удаление', 'Будет создана заявка на удаление и рассмотрена модератором.\n' +
            'После создания заявки благотворители не смогут оставлять пожертвования в текующую организацию и будет недоступно создание новых сборов\n' +
            'Продолжить?', [
            {
                text: 'Отмена',
                style: 'cancel',
            },
            {text: 'Да', onPress: () => requestDelete()},
        ]);
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
            textContent={'Заявка на удаление...'}
            textStyle={{color: "white"}}
        />
        <TitleCard containerStyle={{marginBottom: 20}} title={charity.name} desc={charity.description}
                   tags={charity.tags} options={["Редактировать", "Удалить", "Отмена"]}
                   actions={[onEditClick, onDelete]}/>

        {!campaignsState.loading && campaignsState.campaigns.length == 0 ?
            !charity.requestedDeletion && <Button
                onPress={campaignsState.error == null ? () => nav.navigate("CreateCampaign", {charityID: charityID}) : fetchCampaigns}
                text={campaignsState.error == null ? "Открыть сбор" : "Попробовать снова"}/> :
            <FlatList contentContainerStyle={{padding: 1.5, paddingBottom: 70}} style={{width: "100%"}}
                      data={campaignsState.campaigns}
                      renderItem={({item}) => {
                          return <CampaignListItem campaign={item} onPress={() => {
                              nav.navigate("Campaign", {campaign: item, charityName: charity.name})
                          }} onEditClick={() => {
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