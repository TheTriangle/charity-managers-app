import {
    StyleSheet,
    View,
} from "react-native";
import React from "react";
import {CharityProps} from "../../../Navigate";
import TitleCard from "../components/TitleCard";
import Button from "../../utils/Button";
import {useNavigation} from "@react-navigation/native";
import {useSelector} from "react-redux";
import {selectCharitiesState} from "../../../redux/selectors";

export default function CharityScreen({route: {params: {charityID}}}: CharityProps) {

    const nav = useNavigation<any>()
    const state = useSelector(selectCharitiesState)
    const charity = state.confirmedCharities.find(charity => charity.id == charityID)!!
    // TODO: в редакс сторе хранить данные о кампаниях. при загрузке этого экрана в стор добавлять кампании и отображать их в списке
    const onEditClick = () => {
        nav.navigate("CharityEdit", {charityID: charityID})
    }

    return <View style={styles.container}>
        <TitleCard containerStyle={{marginBottom: 20}} title={charity.name} desc={charity.description} tags={charity.tags} options={["Редактировать", "Удалить", "Отмена"]} actions={[onEditClick]}/>
        <Button onPress={() => nav.navigate("CreateCampaign", {charityID: charityID})} text={"Открыть сбор"}/>
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