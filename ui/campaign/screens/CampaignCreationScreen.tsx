import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    Button as ReactButton,
    View, Linking,
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
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import Modal from "react-native-modal/dist/modal";
import LargeIconButton from "../components/LargeIconButton";
import FileViewComponent from "../components/FileViewComponent";
import ImageRow from "../components/ImageRow";

const reactNativeTagSelect = require("react-native-tag-select")
const TagSelect = reactNativeTagSelect.TagSelect

export default function CampaignCreationScreen({route: {params: {charityID}}}: CampaignCreationProps) {
    const state = useSelector(selectCharitiesState)
    const charity = state.confirmedCharities.find(charity => charity.id == charityID)!!
    const currentDate = new Date()
    const formatter = new Intl.DateTimeFormat('ru-RU', {day: '2-digit', month: '2-digit', year: 'numeric'});

    const [briefDesc, setBriefDesc] = useState<string>(charity ? charity.briefDescription : "")
    const [fullDesc, setFullDesc] = useState<string>(charity ? charity.description : "")
    const [social, setSocial] = useState<string>(charity ? charity.url ? charity.url : "" : "")
    const [checkedTagsCount, setCheckedTagsCount] = useState(charity ? charity.tags.length : 0)
    const [managerContact, setManagerContact] = useState<string>(charity ? charity.managerContact : "")
    const [title, setTitle] = useState("")
    const [paymentAccount, setPaymentAccount] = useState<string>("")
    const [secretKey, setSecretKey] = useState<string>("")
    const [date, setDate] = useState<Date | null>(null)
    const [datePickerOpen, setDatePickerOpen] = useState(false)
    const [amount, setAmount] = useState("")
    const [showModal, setShowModal] = useState(false)
    const [images, setImages] = useState(["", "", "", ""])
    const [files, setFiles] = useState<{uri: string, name: string}[]>([])

    const ref = useRef<typeof TagSelect>()
    const screenHeight = useSafeAreaFrame().height;
    const textInputHeight = screenHeight * 0.04
    const marginVertical = screenHeight * 0.01

    const dispatch = useAppDispatch()
    const nav = useNavigation<any>()

    const getSelectedTags = () => {
        return ref.current!.itemsSelected as TagModel[]
    }

    const resources = useSelector(selectResourceState)

    const copyToClipboard = async (text: string) => {
        await Clipboard.setStringAsync(text);
        Toast.show("Ссылка скопирована", Toast.SHORT)
    };

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

    const selectFiles = async () => {
        const res = await DocumentPicker.getDocumentAsync({type: 'application/pdf', multiple: false});

        if (!res.canceled) {

            const newFiles = [...files];
            res.assets[0].uri
            newFiles.push({uri: res.assets[0].uri, name: res.assets[0].name})

            setFiles(newFiles);

        }
    }

    // TODO: Интерфейс для заголовочного поста эндпоинт для проверки пожретвования


    return <ScrollView>
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

        <Modal isVisible={showModal} onBackButtonPress={() => setShowModal(false)}
               onBackdropPress={() => setShowModal(false)}>
            <View style={{
                alignSelf: "center",
                justifyContent: "center",
                backgroundColor: "white",
                padding: 15,
                borderRadius: 10
            }}>
                <Text>1. Зарегистрируйте кошелек на <Text style={hyperlink}
                                                          onPress={() => Linking.openURL("https://yoomoney.ru/")}>https://yoomoney.ru/</Text> {"\n"}
                    2. Скопируйте номер кошелька из личного кабинета по адресу <Text style={hyperlink}
                                                                                     onPress={() => Linking.openURL("https://yoomoney.ru/settings")}>https://yoomoney.ru/settings</Text>{"\n"}
                    3. Введите номер кошелька в поле ниже{"\n"}
                    4. Перейдите на страницу <Text style={hyperlink}
                                                   onPress={() => Linking.openURL("https://yoomoney.ru/transfer/myservices/http-notification")}>https://yoomoney.ru/transfer/myservices/http-notification</Text> и
                    скопируйте
                    секретный ключ для проверки подлинности(он используется только для валидации уведомлений){"\n"}
                    5. Вставьте секретный ключ в поле "Секрет" в приложении и нажмите отправить{"\n"}
                    6. Скопируйте url из раздела "Обновление данных о сборе"{"\n"}
                    7. Вставьте url в поле "Куда отправлять" на той же странице ЮMoney и нажмите
                    "Протестировать"{"\n"}
                    8. Нажмите на кнопку "Проверить" в приложении</Text>
            </View>
        </Modal>
        <View style={styles.container}>
            <Text style={styles.header}>Платежные данные</Text>

            <Text style={[styles.title, {marginVertical: marginVertical}]}>Номер кошелька ЮMoney</Text>

            <Button onPress={() => setShowModal(true)} text={"Как заполнить?"}
                    containerStyle={{paddingHorizontal: "5%", alignSelf: "flex-start"}}
                    textStyle={{fontSize: 14, paddingHorizontal: "10%"}}/>

            <TextInput
                style={{...styles.textInput, height: textInputHeight}}
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
            <Text style={[styles.title, {marginVertical: marginVertical}]}>Обновление данных о сборе</Text>

            <Text style={{marginVertical: marginVertical}}>Вставьте ваш секретный ключ в поле ниже:</Text>

            <TextInput
                style={{...styles.textInput, height: textInputHeight}}
                placeholder={"Секрет"}
                autoCorrect={false}
                onChangeText={(text) => setSecretKey(text)}
            />

            <Button onPress={undefined} text={"Отправить"}
                    containerStyle={{paddingHorizontal: "5%", alignSelf: "flex-start"}}
                    textStyle={{fontSize: 14, paddingHorizontal: "10%"}}/>

            <Text style={{marginVertical: marginVertical}}>В разделе HTTP-Уведомления укажите следующий url и нажмите
                “протестировать”:</Text>
            <View style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
                marginBottom: marginVertical
            }}>
                <Text style={hyperlink}
                      onPress={() => copyToClipboard("donapp-d2378.web.app/12315231/callback")}>donapp-d2378.web.app/12315231/callback</Text>
                <SvgXml xml={iconCopy} onPress={() => copyToClipboard("donapp-d2378.web.app/12315231/callback")}/>
            </View>

            <Button onPress={undefined} text={"Проверить"}
                    containerStyle={{paddingHorizontal: "5%", alignSelf: "flex-start"}}
                    textStyle={{fontSize: 14, paddingHorizontal: "10%"}}/>


            <Text style={[styles.title, {marginVertical: marginVertical}]}>Ограничение по времени</Text>

            <Pressable style={{height: textInputHeight, width: "100%", marginBottom: marginVertical * 2}}
                       onPress={() => setDatePickerOpen(true)}>
                <TextInput
                    style={{...styles.textInput, height: "100%", color: "black"}}
                    placeholder={"дд/мм/гггг"}
                    editable={false}
                    value={date ? formatter.format(date) : ""}

                />
            </Pressable>


            <Text style={[styles.title, {marginVertical: marginVertical}]}>Необходимая сумма</Text>

            <View style={{width: "100%", height: textInputHeight}}>
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

            <Text style={[styles.header, {marginVertical: marginVertical, marginTop: marginVertical * 2}]}>Главная
                запись</Text>

            <Text style={[styles.title, {marginVertical: marginVertical}]}>Название (также название кампании)</Text>

            <TextInput
                style={{...styles.textInput, height: textInputHeight}}
                placeholder={"Название"}
                autoCorrect={false}
                onChangeText={(text) => setTitle(text)}
            />

            <Text style={[styles.title, {marginVertical: marginVertical}]}>Описание</Text>

            <TextInput multiline={true}
                       style={[styles.textInput, {
                           height: screenHeight * 0.22,
                           textAlignVertical: "top",
                           paddingTop: 2,
                           marginVertical: marginVertical
                       }]}

                       onChangeText={(text) => setFullDesc(text)}
                       placeholder={"Описание"}/>
            <Text style={[styles.title, {marginVertical: marginVertical}]}>Прикрепите вложения</Text>

            <ImageRow onClick={undefined} source={images} setSource={(newImages) => {
                setImages(newImages)
            }} dimen={screenHeight * 0.10}/>

            {files.length < 2 &&
                <LargeIconButton containerStyle={{height: screenHeight * 0.06, marginVertical: marginVertical}}
                                 onPress={selectFiles} text={"Добавить документ"}/>}

            {files.map((value, index) => {
                    return <FileViewComponent key={index} containerStyle={{height: screenHeight * 0.06, marginVertical: marginVertical}}
                                              onRemove={() => {
                                                  const copy = [...files]
                                                  copy.splice(index, 1)
                                                  setFiles(copy )
                                              }} text={value.name}/>

            })}


        </View>
    </ScrollView>
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