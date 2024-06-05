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
import {Checkbox} from "../../utils/CheckBox";


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
    const [loadingTitle, setLoadingTitle] = useState("Creation")
    const [highPriority, setHighPriority] = useState(false)

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
        Toast.show("Link copied", Toast.SHORT)
    };


    const requestCreateCampaign = async () => {
        const campaign: CampaignModel = {
            collectedamount: 0,
            parentcharity: charityID,
            totalamount: isNaN(Number(amount)) ? 0 : Number(amount),
            name: title,
            confirmednotifications: notificationsConfirmed,
            highPriority: highPriority
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
                setLoadingTitle("Creation")
                await dispatch(createCampaign({documentID: docID, campaign: campaign, pinnedPost: post})).unwrap()
                nav.pop()
            } else {
                Toast.show("Fill in payment data to create charity", Toast.LONG)
            }

        } catch (e) {
            console.log(e)
            Toast.show("Creation cancelled", Toast.LONG)
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
            Toast.show("Wallet number must include 16 digits", Toast.LONG);
            return;
        }
        if (secretKey.length !== 24) {
            Toast.show("Secret key must consist of 24 symbols", Toast.LONG);
            return;
        }

        try {
            setNotificationsConfirmed(false)
            setLoadingTitle("Sending")
            const id = await dispatch(requestCreatePayment({secret: secretKey, yoomoney: paymentAccount})).unwrap()
            setDocID(id)
        } catch (e) {
            console.log(e)
            Toast.show("Could not send data", Toast.LONG)
        }
    }

    const getConfirmation = async () => {
        try {

            if (docID === undefined || docID.length == 0) {
                Toast.show("Must send payment data first", Toast.LONG)
                return
            }
            setLoadingTitle("Checking")
            const confirmed = await dispatch(getPaymentConfirmation({campaign: docID})).unwrap()
            setNotificationsConfirmed(confirmed)
            if (confirmed) {
                Toast.show("Wallet confirmed!", Toast.SHORT)
            } else {
                Toast.show("Could not confirm wallet, make sure YooMoney notification was sent", Toast.SHORT)
            }

        } catch (e) {
            console.log(e)
            Toast.show("Could not receive data", Toast.LONG)
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
                <Text>1. Register wallet at <Text style={hyperlink}
                                                          onPress={() => Linking.openURL("https://yoomoney.ru/")}>https://yoomoney.ru/</Text> {"\n"}
                    2. Copy wallet number from your profile at <Text style={hyperlink}
                                                                                     onPress={() => Linking.openURL("https://yoomoney.ru/settings")}>https://yoomoney.ru/settings</Text>{"\n"}
                    3. Enter wallet number in the field below{"\n"}
                    4. Go to the page <Text style={hyperlink}
                                                   onPress={() => Linking.openURL("https://yoomoney.ru/transfer/myservices/http-notification")}>https://yoomoney.ru/transfer/myservices/http-notification</Text> and
                    Copy the secret key (it is used only to validate your notifications){"\n"}
                    5. Paste the secret key to the "Secret" field and press send{"\n"}
                    6. Copy url from "campaign data update" section {"\n"}
                    7. Past url to the "Sending target" on the YooMoney page and press "test"{"\n"}
                    8. Click "check" in the application</Text>
            </View>
        </Modal>
        <View style={styles.container}>
            <Text style={styles.header}>Payment data</Text>

            <Text style={[styles.title, {marginVertical: marginVertical}]}>YooMoney wallet number</Text>

            <Button onPress={() => setShowModal(true)} text={"How to fill?"}
                    containerStyle={{paddingHorizontal: "5%", alignSelf: "flex-start"}}
                    textStyle={{fontSize: 14, paddingHorizontal: "10%"}}/>

            <TextInput
                style={{...styles.textInput, height: textInputHeight}}
                placeholder={"Wallet"}
                autoCorrect={false}
                keyboardType={"numeric"}
                maxLength={16}
                value={paymentAccount}
                onChangeText={(text) => handlePaymentChange(text)}
            />

            <Text style={styles.title}>
                Tags
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
            <Text style={[styles.title, {marginVertical: marginVertical}]}>Campaign data udate</Text>

            <Text style={{marginVertical: marginVertical}}>Paste your secret key here:</Text>

            <TextInput
                style={{...styles.textInput, height: textInputHeight}}
                placeholder={"Secret"}
                autoCorrect={false}
                onChangeText={(text) => setSecretKey(text)}
            />

            <Button onPress={createPayment} text={"Send"}
                    containerStyle={{paddingHorizontal: "5%", alignSelf: "flex-start"}}
                    textStyle={{fontSize: 14, paddingHorizontal: "10%"}}/>

            <Text style={{marginVertical: marginVertical}}>In the http-notifications section paste the following url and press "test":</Text>
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

            <Button onPress={getConfirmation} text={"Check"}
                    containerStyle={{paddingHorizontal: "5%", alignSelf: "flex-start"}}
                    textStyle={{fontSize: 14, paddingHorizontal: "10%"}}/>


            <Text style={[styles.title, {marginVertical: marginVertical}]}>Time limit</Text>

            <Pressable style={{height: textInputHeight, width: "100%", marginBottom: marginVertical * 2}}
                       onPress={() => setDatePickerOpen(true)}>
                <TextInput
                    style={{...styles.textInput, height: "100%", color: "black"}}
                    placeholder={"dd/mm/yyyy (optional)"}
                    editable={false}
                    value={date ? formatter.format(date) : ""}

                />
            </Pressable>


            <Text style={[styles.title, {marginVertical: marginVertical}]}>Required amount</Text>

            <View style={{width: "100%", height: textInputHeight}}>
                <TextInput
                    style={{...styles.textInput, height: "100%"}}
                    placeholder={"Amount (optional)"}
                    autoCorrect={false}
                    value={amount}
                    keyboardType={"numeric"}
                    onChangeText={(text) => handleAmountChange(text)}
                />
                <SvgXml xml={iconRouble} style={{position: "absolute", right: "2%", top: "45%"}}/>
            </View>

            <Pressable style={{flexDirection: "row", flex: 1, alignItems: "center", marginTop: marginVertical * 3}} onPress={() => {setHighPriority(prev => !prev)}}>
                <Checkbox onChange={() => {setHighPriority(prev => !prev)}} checked={highPriority}/>
                <Text style={{marginLeft: 10}}>Urgent campaign</Text>
            </Pressable>

            <Text style={[styles.header, {marginVertical: marginVertical, marginTop: marginVertical * 2}]}>Main post</Text>

            <Text style={[styles.title, {marginVertical: marginVertical}]}>Name (Also campaign's name)</Text>

            <TextInput
                style={{...styles.textInput, height: textInputHeight}}
                placeholder={"Name"}
                maxLength={70}
                autoCorrect={false}
                onChangeText={(text) => setTitle(text)}
            />

            <Text style={[styles.title, {marginVertical: marginVertical}]}>Description</Text>

            <TextInput multiline={true}
                       style={[styles.textInput, {
                           height: screenHeight * 0.22,
                           textAlignVertical: "top",
                           paddingTop: 2,
                           marginVertical: marginVertical
                       }]}

                       onChangeText={(text) => setFullDesc(text)}
                       placeholder={"Description"}/>
            <Text style={[styles.title, {marginVertical: marginVertical}]}>Attachments</Text>

            <ImageRow onClick={undefined} source={images} setSource={(newImages) => {
                setImages(newImages)
            }} dimen={screenHeight * 0.10}/>

            {files.length < 2 &&
                <LargeIconButton containerStyle={{height: screenHeight * 0.06, marginVertical: marginVertical}}
                                 onPress={selectFiles} text={"Add document"}/>}

            {files.map((value, index) => {
                return <FileViewComponent key={index}
                                          containerStyle={{height: screenHeight * 0.06, marginVertical: marginVertical}}
                                          onRemove={() => {
                                              const copy = [...files]
                                              copy.splice(index, 1)
                                              setFiles(copy)
                                          }} text={value.name}/>

            })}

            <Button containerStyle={{marginVertical: marginVertical}} onPress={requestCreateCampaign} text={"Done"}
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