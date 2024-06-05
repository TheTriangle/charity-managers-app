import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View, Alert,
} from "react-native";
import React, {useRef, useState} from "react";
import {textInput} from "../../../styles/styles";
import {SvgXml} from "react-native-svg";
import {useSelector} from "react-redux";
import {selectCampaignsState, selectResourceState} from "../../../redux/selectors";
import {TagModel} from "../../../data/model/TagModel";
import {PRIMARY_COLOR} from "../../../styles/colors";
import {DefaultTheme, useNavigation} from "@react-navigation/native";
import Button from "../../utils/Button";
import {useAppDispatch} from "../../../hooks";
import Spinner from "react-native-loading-spinner-overlay";
import {UpdateCampaignProps} from "../../../Navigate";
import Toast from "react-native-simple-toast";
import {iconRouble} from "../../../assets/iconRouble";
import DatePicker from "react-native-date-picker";
import {
    updateCampaign
} from "../../../redux/slices/campaignsSlice";
import {Checkbox} from "../../utils/CheckBox";


const reactNativeTagSelect = require("react-native-tag-select")
const TagSelect = reactNativeTagSelect.TagSelect

export default function CampaignUpdateScreen({route: {params: {campaign}}}: UpdateCampaignProps) {
    const state = useSelector(selectCampaignsState)
    const currentDate = new Date()
    const formatter = new Intl.DateTimeFormat('ru-RU', {day: '2-digit', month: '2-digit', year: 'numeric'});

    const [checkedTagsCount, setCheckedTagsCount] = useState(0)
    const [datePickerOpen, setDatePickerOpen] = useState(false)
    const [totalAmount, setTotalAmount] = useState<string>(campaign.totalamount.toString())
    const [amount, setAmount] = useState("")
    const [highPriority, setHighPriority] = useState<boolean>(campaign.highPriority === true)
    const [displayedDate, setDisplayedDate] = useState<string>(campaign.enddate ? campaign.enddate : "")


    const ref = useRef<typeof TagSelect>()

    const dispatch = useAppDispatch()
    const nav = useNavigation<any>()

    const resources = useSelector(selectResourceState)

    const getSelectedTags = () => {
        return ref.current!.itemsSelected as TagModel[]
    }

    const handleAmountChange = (text: string) => {
        if (/^\d+$/.test(text) || text === '') {
            setAmount(text);
        }
    }

    const handleTotalAmountChange = (text: string) => {
        if (/^\d+$/.test(text) || text === '') {
            setTotalAmount(text);
        }
    }

    const requestUpdate = async () => {
        const newTotal = isNaN(Number(totalAmount)) ? 0 : Number(totalAmount)
        if (newTotal < campaign.totalamount) {
            Alert.alert('Error', 'Collected amount can not be reduced', [
                {text: 'OK'},
            ]);
            return
        }
        try {
            await dispatch(updateCampaign({
                id: campaign.id!!,
                tags: checkedTagsCount == 0 ? [] : getSelectedTags(),
                increment: isNaN(Number(amount)) ? 0 : Number(amount),
                totalAmount: newTotal,
                date: displayedDate,
                highPriority: highPriority
            })).unwrap()
            nav.pop()
        } catch (e) {
            console.log(e)
            Toast.show("Campaign update error", Toast.LONG)
        }
    }

    return <>
        <Spinner
            visible={state.updateLoading}
            textContent={"Updating..."}
            textStyle={{color: "white"}}
        />

        <DatePicker
            modal
            open={datePickerOpen}
            date={currentDate}
            minimumDate={currentDate}
            mode={"date"}
            onConfirm={(date) => {
                setDatePickerOpen(false)
                setDisplayedDate(formatter.format(date))
            }}
            onCancel={() => {
                setDatePickerOpen(false)
                setDisplayedDate("")
            }}
        />

        <View style={styles.container}>

            <Text style={[styles.title]}>Required sum</Text>

            <View style={{width: "100%", height: "5%", marginBottom: "1%"}}>
                <TextInput
                    style={{...styles.textInput, height: "100%"}}
                    placeholder={"Required sum"}
                    autoCorrect={false}
                    value={totalAmount}
                    keyboardType={"numeric"}
                    onChangeText={(text) => handleTotalAmountChange(text)}
                />
                <SvgXml xml={iconRouble} style={{position: "absolute", right: "2%", top: "45%"}}/>
            </View>

            <Text style={[styles.title]}>Add to collected amount</Text>

            <View style={{width: "100%", height: "5%", marginBottom: "1%"}}>
                <TextInput
                    style={{...styles.textInput, height: "100%"}}
                    placeholder={"Sum"}
                    autoCorrect={false}
                    value={amount}
                    keyboardType={"numeric"}
                    onChangeText={(text) => handleAmountChange(text)}
                />
                <SvgXml xml={iconRouble} style={{position: "absolute", right: "2%", top: "45%"}}/>
            </View>


            <Text style={[styles.title]}>
                Tags
            </Text>
            <View style={{marginVertical: "1%"}}>
                <TagSelect
                    value={campaign.tags}
                    data={resources.tags}
                    max={5}
                    ref={ref}
                    onItemPress={() => setCheckedTagsCount(ref.current!.totalSelected)}
                    labelAttr={"title"}
                    keyAttr={"id"}
                    itemStyle={styles.bulletContainer}
                    itemStyleSelected={styles.bulletContainerSelected}
                    itemLabelStyle={styles.bulletTextStyle}
                    onMaxError={() => {
                    }}
                />
            </View>

            <Pressable style={{flexDirection: "row", alignItems: "center", marginVertical: "1%"}} onPress={() => {setHighPriority(prev => !prev)}}>
                <Checkbox onChange={() => {setHighPriority(prev => !prev)}} checked={highPriority}/>
                <Text style={{marginLeft: 10}}>Urgent campaign</Text>
            </Pressable>


            <Text style={[styles.title, {marginVertical: "1%"}]}>Deadline</Text>

            <Pressable style={{height: "5%", width: "100%", marginBottom: "2%"}}
                       onPress={() => setDatePickerOpen(true)}>
                <TextInput
                    style={{...styles.textInput, height: "100%", color: "black"}}
                    placeholder={"дд/мм/гггг"}
                    editable={false}
                    value={displayedDate}

                />
            </Pressable>
        </View>
        <Button containerStyle={{marginVertical: "1%", bottom: 10}} onPress={requestUpdate} text={"Done"}
        />
    </>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: "4%",
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
    },
    bulletContainer: {
        borderRadius: 100,
        paddingVertical: 2,
        backgroundColor: DefaultTheme.colors.background,
        borderColor: PRIMARY_COLOR
    },
    bulletContainerSelected: {
        borderRadius: 100,
        paddingVertical: 2,
        backgroundColor: PRIMARY_COLOR,
        borderColor: PRIMARY_COLOR
    },
    bulletTextStyle: {
        color: PRIMARY_COLOR
    },
})