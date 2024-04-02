import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import React, {useRef, useState} from "react";
import {hyperlink, textInput} from "../../../styles/styles";
import {SvgXml} from "react-native-svg";
import {iconSocial} from "../../../assets/iconSocial";
import {iconGeo} from "../../../assets/iconGeo";
import {useSelector} from "react-redux";
import {selectCharitiesState, selectResourceState} from "../../../redux/selectors";
import {TagModel} from "../../../data/model/TagModel";
import {HYPERLINK_BLUE, PRIMARY_COLOR} from "../../../styles/colors";
import {DefaultTheme, useNavigation} from "@react-navigation/native";
import Button from "../../utils/Button";
import {useSafeAreaFrame} from "react-native-safe-area-context";
import {pickPlace} from 'react-native-place-picker';
import {PlacePickerResults} from "react-native-place-picker/src/interfaces";
import {useAppDispatch} from "../../../hooks";
import Spinner from "react-native-loading-spinner-overlay";
import {CampaignCreationProps, CharityEditProps, CreateCharityProps} from "../../../Navigate";
import {editConfirmedCharity} from "../../../redux/slices/charitiesSlice";
import {isFirebaseError} from "../../../utils/isFirebaseError";
import Toast from "react-native-simple-toast";
import {iconCopy} from "../../../assets/iconCopy";
import {iconRouble} from "../../../assets/iconRouble";
import DatePicker from "react-native-date-picker";

const reactNativeTagSelect = require("react-native-tag-select")
const TagSelect = reactNativeTagSelect.TagSelect

export default function CampaignCreationScreen({route: {params: {charityID}}}: CampaignCreationProps) {
    const state = useSelector(selectCharitiesState)
    const charity = state.confirmedCharities.find(charity => charity.id == charityID)!!
    const currentDate = new Date()
    const formatter = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const [briefDesc, setBriefDesc] = useState<string>(charity ? charity.briefDescription : "")
    const [fullDesc, setFullDesc] = useState<string>(charity ? charity.description : "")
    const [social, setSocial] = useState<string>(charity ? charity.url ? charity.url : "" : "")
    const [checkedTagsCount, setCheckedTagsCount] = useState(charity ? charity.tags.length : 0)
    const [managerContact, setManagerContact] = useState<string>(charity ? charity.managerContact : "")
    const [paymentAccount, setPaymentAccount] = useState<string>("")
    const [secretKey, setSecretKey] = useState<string>("")
    const [date, setDate] = useState<Date | null>(null)
    const [datePickerOpen, setDatePickerOpen] = useState(false)
    const [amount, setAmount] = useState("")

    const ref = useRef<typeof TagSelect>()
    const screenHeight = useSafeAreaFrame().height;
    const textInputHeight = screenHeight * 0.05
    const marginVertical = screenHeight * 0.01

    const dispatch = useAppDispatch()
    const nav = useNavigation<any>()

    const getSelectedTags = () => {
        return ref.current!.itemsSelected as TagModel[]
    }

    const resources = useSelector(selectResourceState)


    const formValid = () => {
        return briefDesc.length != 0 &&
            fullDesc.length != 0 &&
            social.length != 0 &&
            checkedTagsCount != 0 &&
            managerContact.length != 0
    }

    const handleAmountChange = (text: string) => {
        if (/^\d+$/.test(text) || text === '') {
            setAmount(text);
        }
    };

    // TODO: Интерфейс для заголовочного поста эндпоинт для проверки пожретвования


    return <>
        <Spinner
            visible={state.editLoading}
            textContent={'Создание...'}
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
                setDate(date)
            }}
            onCancel={() => {
                setDatePickerOpen(false)
                setDate(null)
            }}
        />

        <View style={styles.container}>
            <Text style={[styles.title, {marginVertical: "1%"}]}>Номер кошелька ЮMoney</Text>

            <Button onPress={undefined} text={"Как найти?"}
                    containerStyle={{paddingHorizontal: "5%", alignSelf: "flex-start"}} textStyle={{fontSize: 14}}/>

            <TextInput
                style={{...styles.textInput, height: "4%"}}
                placeholder={"Кошелек"}
                autoCorrect={false}
                keyboardType={"numeric"}
                onChangeText={(text) => setPaymentAccount(text)}
            />

            <Text style={styles.title}>
                Тэги
            </Text>
            <View style={{marginVertical: marginVertical}}>
                <TagSelect
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
            <Text style={[styles.title, {marginVertical: "1%"}]}>Обновление данных о сборе</Text>
            <Text style={{marginVertical: "1%"}}>В разделе HTTP-Уведомления укажите следующий url и нажмите
                “протестировать”:</Text>
            <View style={{flexDirection: "row", justifyContent: "space-between", width: "100%"}}>
                <Text style={hyperlink}>donapp-d2378.web.app/12315231/callback</Text>
                {/*TODO: onclick to clipboard*/}
                <SvgXml xml={iconCopy}/>
            </View>

            <Text style={{marginVertical: "1%"}}>Вставьте ваш секретный ключ в поле ниже:</Text>

            <TextInput
                style={{...styles.textInput, height: "4%"}}
                placeholder={"Секрет"}
                autoCorrect={false}
                keyboardType={"numeric"}
                onChangeText={(text) => setSecretKey(text)}
            />

            <Button onPress={undefined} text={"Проверить"}
                    containerStyle={{paddingHorizontal: "5%", alignSelf: "flex-start"}}
                    textStyle={{fontSize: 14, paddingHorizontal: "10%"}}/>

            <Text style={[styles.title, {marginVertical: "1%"}]}>Ограничение по времени</Text>

            <Pressable style={{height: "4%", width: "100%", marginBottom: "2%"}} onPress={() => setDatePickerOpen(true)}>
                <TextInput
                    style={{...styles.textInput, height: "100%", color: "black"}}
                    placeholder={"дд/мм/гггг"}
                    editable={false}
                    value={date ? formatter.format(date) : ""}

                />
            </Pressable>


            <Text style={[styles.title, {marginVertical: "1%"}]}>Необходимая сумма</Text>

            <View style={{width: "100%", height: "4%"}}>
                <TextInput
                    style={{...styles.textInput, height: "100%"}}
                    placeholder={"Сумма"}
                    autoCorrect={false}
                    value={amount}
                    keyboardType={"numeric"}
                    onChangeText={(text) => handleAmountChange(text)}
                />
                <SvgXml xml={iconRouble} style={{position: "absolute", right: "2%", top: "45%"}}/>
            </View>

        </View>
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