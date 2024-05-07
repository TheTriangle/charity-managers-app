import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View, Linking,
} from "react-native";
import React, {useRef, useState} from "react";
import {hyperlink, textInput} from "../../../styles/styles";
import {SvgXml} from "react-native-svg";
import {useSelector} from "react-redux";
import {selectCampaignsState, selectResourceState} from "../../../redux/selectors";
import {TagModel} from "../../../data/model/TagModel";
import {PRIMARY_COLOR} from "../../../styles/colors";
import {DefaultTheme, useNavigation} from "@react-navigation/native";
import Button from "../../utils/Button";
import {useSafeAreaFrame} from "react-native-safe-area-context";
import {useAppDispatch} from "../../../hooks";
import Spinner from "react-native-loading-spinner-overlay";
import {CampaignCreationProps} from "../../../Navigate";
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
import {CampaignModel} from "../../../data/model/CampaignModel";
import {PostLocalModel} from "../../../data/model/PostLocalModel";
import firebase from "firebase/compat";
import FieldValue = firebase.firestore.FieldValue;
import {createCampaign, getPaymentConfirmation, requestCreatePayment} from "../../../redux/slices/campaignsSlice";


const reactNativeTagSelect = require("react-native-tag-select")
const TagSelect = reactNativeTagSelect.TagSelect

export default function CampaignCreationScreen({route: {params: {charityID}}}: CampaignCreationProps) {
    const state = useSelector(selectCampaignsState)
    const currentDate = new Date()
    const formatter = new Intl.DateTimeFormat('ru-RU', {day: '2-digit', month: '2-digit', year: 'numeric'});

    const [fullDesc, setFullDesc] = useState<string>("")
    const [checkedTagsCount, setCheckedTagsCount] = useState(0)
    const [title, setTitle] = useState("")
    const [paymentAccount, setPaymentAccount] = useState<string>("")
    const [secretKey, setSecretKey] = useState<string>("")
    const [date, setDate] = useState<Date | null>(null)
    const [datePickerOpen, setDatePickerOpen] = useState(false)
    const [amount, setAmount] = useState("")
    const [showModal, setShowModal] = useState(false)
    const [images, setImages] = useState(["", "", "", ""])
    const [files, setFiles] = useState<{ uri: string, name: string }[]>([])
    const [docID, setDocID] = useState<string | undefined>(undefined)
    const [notificationsConfirmed, setNotificationsConfirmed] = useState(false)
    const [loadingTitle, setLoadingTitle] = useState("Создание")

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


    const requestCreateCampaign = async () => {
        const campaign: CampaignModel = {
            collectedamount: 0,
            parentcharity: charityID,
            totalamount: isNaN(Number(amount)) ? 0 : Number(amount),
            name: title,
            confirmednotifications: notificationsConfirmed,
        }
        paymentAccount !== "" && (campaign.yoomoney = paymentAccount)
        checkedTagsCount !== 0 && (campaign.tags = getSelectedTags())
        date !== null && (campaign.enddate = formatter.format(date))

        const post: PostLocalModel = {
            pinned: true,
            header: title,
            fulltext: fullDesc,
            date: FieldValue.serverTimestamp(),
            likesCount: 0,
            commentsCount: 0
        }

        files.length !== 0 ? (post.documents = files) : post.documents = []
        const filteredImages = images.filter(value => value !== "")
        filteredImages.length !== 0 ? (post.images = filteredImages) : post.images = []


        try {
            if (notificationsConfirmed && docID) {
                setLoadingTitle("Создание")
                await dispatch(createCampaign({documentID: docID, campaign: campaign, pinnedPost: post})).unwrap()
                nav.pop()
            } else {
                Toast.show("Для создания кампании необходимо указать платежные данные", Toast.LONG)
            }

        } catch (e) {
            console.log(e)
            Toast.show("Не создать кампанию", Toast.LONG)
        }

    }

    const formValid = () => {
        return fullDesc.length != 0 &&
            title.length != 0 && (!isNaN(Number(amount)) || amount.length == 0) && notificationsConfirmed
    }

    const handlePaymentChange = (text: string) => {
        if (/^\d+$/.test(text) || text === '') {
            setPaymentAccount(text);
        }
    };

    const handleAmountChange = (text: string) => {
        if (/^\d+$/.test(text) || text === '') {
            setAmount(text);
        }
    };

    const createPayment = async () => {
        if (!/^\d{16}$/.test(paymentAccount)) {
            Toast.show("Номер кошелька должен состоять из 16 цифр", Toast.LONG);
            return;
        }
        if (secretKey.length !== 24) {
            Toast.show("Секретный ключ должен состоять из 24 символов", Toast.LONG);
            return;
        }

        try {
            setNotificationsConfirmed(false)
            setLoadingTitle("Отправка")
            const id = await dispatch(requestCreatePayment({secret: secretKey, yoomoney: paymentAccount})).unwrap()
            setDocID(id)
        } catch (e) {
            console.log(e)
            Toast.show("Не удалось отправить данные", Toast.LONG)
        }
    }

    const getConfirmation = async () => {
        try {

            if (docID === undefined || docID.length == 0) {
                Toast.show("Сначала необходимо отправить платежные данные", Toast.LONG)
                return
            }
            setLoadingTitle("Проверка")
            const confirmed = await dispatch(getPaymentConfirmation({campaign: docID})).unwrap()
            setNotificationsConfirmed(confirmed)
            if (confirmed) {
                Toast.show("Кошелек успешно привязан!", Toast.SHORT)
            } else {
                Toast.show("Не удалось подтвердить кошелек, убедитесь, что уведомление ЮMoney отправлено", Toast.SHORT)
            }

        } catch (e) {
            console.log(e)
            Toast.show("Не удалось получить данные", Toast.LONG)
        }
    }

    const selectFiles = async () => {
        const res = await DocumentPicker.getDocumentAsync({type: 'application/pdf', multiple: false});

        if (!res.canceled) {
            const newFiles = [...files];
            res.assets[0].uri
            newFiles.push({uri: res.assets[0].uri, name: res.assets[0].name})
            setFiles(newFiles);
        }
    }

    return <ScrollView>
        <Spinner
            visible={state.createLoading}
            textContent={loadingTitle}
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
                maxLength={16}
                value={paymentAccount}
                onChangeText={(text) => handlePaymentChange(text)}
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

            <Button onPress={createPayment} text={"Отправить"}
                    containerStyle={{paddingHorizontal: "5%", alignSelf: "flex-start"}}
                    textStyle={{fontSize: 14, paddingHorizontal: "10%"}}/>

            <Text style={{marginVertical: marginVertical}}>В разделе HTTP-Уведомления укажите следующий url и нажмите
                “протестировать”:</Text>
            {docID && <View style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
                marginBottom: marginVertical
            }}>
                <Text style={hyperlink}
                      onPress={() => copyToClipboard(`https://us-central1-donapp-d2378.cloudfunctions.net/updatePayment/${docID}`)}>https://us-central1-donapp-d2378.cloudfunctions.net/updatePayment/{docID}</Text>
                <SvgXml xml={iconCopy}
                        onPress={() => copyToClipboard(`https://us-central1-donapp-d2378.cloudfunctions.net/updatePayment/${docID}`)}/>
            </View>}

            <Button onPress={getConfirmation} text={"Проверить"}
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
                maxLength={70}
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
                return <FileViewComponent key={index}
                                          containerStyle={{height: screenHeight * 0.06, marginVertical: marginVertical}}
                                          onRemove={() => {
                                              const copy = [...files]
                                              copy.splice(index, 1)
                                              setFiles(copy)
                                          }} text={value.name}/>

            })}

            <Button containerStyle={{marginVertical: marginVertical}} onPress={requestCreateCampaign} text={"Готово"}
                    active={formValid()}
            />
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