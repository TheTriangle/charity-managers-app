import {Pressable, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {PRIMARY_COLOR} from "../../../styles/colors";
import {CampaignModel} from "../../../data/model/CampaignModel";
import {SvgXml} from "react-native-svg";
import {iconRemoveX} from "../../../assets/iconRemoveX";
import {editIcon} from "../../../assets/editIcon";
import {iconLock} from "../../../assets/iconLock";

export default function CampaignListItem({campaign, containerStyle, onPress, onRemoveClick, onEditClick}: {
    campaign: CampaignModel,
    containerStyle?: ViewStyle,
    onPress: (campaign: CampaignModel) => void,
    onRemoveClick: (campaign: CampaignModel) => void,
    onEditClick: (campaign: CampaignModel) => void,
}) {

    const fillPercentage = campaign.totalamount == 0 ? 0 :
        (campaign.collectedamount > campaign.totalamount ? 100 : (campaign.collectedamount / campaign.totalamount) * 100)

    const textValue = campaign.name.length >= 25 ? campaign.name.substring(0, 23) + "..." : campaign.name

    return (
        <View style={[styles.container, containerStyle]}>

            {(campaign.closed == undefined || !campaign.closed) && <SvgXml onPress={() => onRemoveClick(campaign)} xml={iconRemoveX} scaleY={0.8} scaleX={0.8}/>}
            {campaign.closed && <SvgXml onPress={undefined} xml={iconLock} scaleY={0.8} scaleX={0.8}/>}
            <Pressable onPress={() => onPress(campaign)} style={styles.pressableContainer}>

                <View style={[styles.collectedContainer, {width: `${fillPercentage}%`}]}/>
                <Text style={{position: "absolute", alignSelf: "center", top: "15%"}}>{textValue}</Text>
            </Pressable>
            {(campaign.closed == undefined  || !campaign.closed) && <SvgXml onPress={() => onEditClick(campaign)} xml={editIcon} scaleY={0.9} scaleX={0.9}/>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        alignItems: "center",
        alignContent: "center",
        justifyContent: "center",
        padding: "2%",
        borderRadius: 10,
        shadowRadius: 2,
        shadowOffset: {width: 3, height: 3},
        shadowColor: "black",
        shadowOpacity: 0.5,
        elevation: 3,
        flexDirection: "row",
        width: "100%",
        height: "7%",
    },
    label: {
        alignSelf: "flex-start",
        fontWeight: "800",
        fontSize: 20,
    },
    pressableContainer: {
        backgroundColor: "#97C3F3",
        borderRadius: 20,
        padding: 2,
        flex: 1,
        height: "100%"
    },
    collectedContainer: {
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 20,
        flex: 1
    },
    buttonContainer: {
        borderRadius: 30,
        backgroundColor: PRIMARY_COLOR,
        paddingHorizontal: 40,
        paddingVertical: 2
    },
    buttonText: {
        color: "white",
        fontWeight: "500"
    }
});
