import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import React, {useEffect, useRef, useState} from "react";
import {textInput} from "../../../styles/styles";
import {SvgXml} from "react-native-svg";
import {iconSocial} from "../../../assets/iconSocial";
import {iconGeo} from "../../../assets/iconGeo";
import {useSelector} from "react-redux";
import {selectCharitiesState, selectResourceState} from "../../../redux/selectors";
import {TagModel} from "../../../data/model/TagModel";
import {PRIMARY_COLOR} from "../../../styles/colors";
import {DefaultTheme, useNavigation} from "@react-navigation/native";
import Button from "../../utils/Button";
import {useSafeAreaFrame} from "react-native-safe-area-context";
import {useAppDispatch} from "../../../hooks";
import Spinner from "react-native-loading-spinner-overlay";
import {CharityEditProps} from "../../../Navigate";
import {editConfirmedCharity} from "../../../redux/slices/charitiesSlice";
import {isFirebaseError} from "../../../utils/isFirebaseError";
import Toast from "react-native-simple-toast";

const reactNativeTagSelect = require("react-native-tag-select")
const TagSelect = reactNativeTagSelect.TagSelect

export default function CharityEditScreen({route: {params: {charityID, location, id}}}: CharityEditProps) {
    const state = useSelector(selectCharitiesState)
    const charity = state.confirmedCharities.find(charity => charity.id == charityID)!!

    const [briefDesc, setBriefDesc] = useState<string>(charity ? charity.briefDescription : "")
    const [fullDesc, setFullDesc] = useState<string>(charity ? charity.description : "")
    const [social, setSocial] = useState<string>(charity ? charity.url ? charity.url : "" : "")
    const [checkedTagsCount, setCheckedTagsCount] = useState(charity ? charity.tags.length : 0)
    const [managerContact, setManagerContact] = useState<string>(charity ? charity.managerContact : "")
    const [selectedAddress, setSelectedAddress] = useState<string | undefined>(charity ? charity.address ? charity.address : undefined : undefined);
    const [selectedCoords, setSelectedCoords] = useState<LocationModel | undefined>(charity ? charity.location ? charity.location : undefined : undefined);

    const ref = useRef<typeof TagSelect>()
    const screenHeight = useSafeAreaFrame().height;
    const textInputHeight = screenHeight * 0.04
    const marginVertical = screenHeight * 0.01

    const dispatch = useAppDispatch()
    const nav = useNavigation<any>()

    const getSelectedTags = () => {
        return ref.current!.itemsSelected as TagModel[]
    }

    useEffect(() => {
        if (location) {
            setSelectedCoords({latitude: location.latitude, longitude: location.longitude})
            setSelectedAddress(location.address)
        }
    }, [location]);

    const resources = useSelector(selectResourceState)

    const formValid = () => {
        return briefDesc.length != 0 &&
            fullDesc.length != 0 &&
            social.length != 0 &&
            checkedTagsCount != 0 &&
            managerContact.length != 0
    }

    const editCharity = async () => {
        const charity = {
            id: id,
            address: selectedAddress,
            briefDescription: briefDesc,
            description: fullDesc,
            location: selectedCoords,
            managerContact: managerContact,
            tags: getSelectedTags(),
            url: social
        }
        try {
            await dispatch(editConfirmedCharity(charity)).unwrap()
            nav.pop()
        } catch (e) {
            if (isFirebaseError(e)) {
                console.log(e.message)
            }
            Toast.show("Не удалось отредактировать данные", Toast.LONG)
        }
    }

    return <ScrollView>
        <Spinner
            visible={state.editLoading}
            textContent={'Редактирование...'}
            textStyle={{color: "white"}}
        />
        <View style={styles.container}>
            <Text style={[styles.header]}>Видят благотворители</Text>
            <Text style={[styles.title, {marginVertical}]}>Краткое описание</Text>

            <TextInput multiline={true}
                       numberOfLines={15}
                       style={[styles.textInput, {
                           height: screenHeight * 0.1,
                           textAlignVertical: "top",
                           paddingTop: 2,
                           marginVertical: marginVertical
                       }]}
                       maxLength={300}
                       value={briefDesc}
                       onChangeText={(text) => setBriefDesc(text)}
                       placeholder={"Краткое описание"}/>
            <Text style={[styles.title, {marginVertical}]}>Полное описание</Text>
            <TextInput multiline={true}
                       style={[styles.textInput, {
                           height: screenHeight * 0.22,
                           textAlignVertical: "top",
                           paddingTop: 2,
                           marginVertical: marginVertical
                       }]}
                       value={fullDesc}
                       onChangeText={(text) => setFullDesc(text)}
                       placeholder={"Полное описание"}/>
            <Text style={[styles.title, {marginVertical}]}>Сайт или соц. сеть</Text>
            <View style={{
                flexDirection: "row",
                height: textInputHeight,
                alignItems: "center",
                marginVertical: marginVertical
            }}>
                <SvgXml xml={iconSocial} style={{marginRight: "1%"}}/>
                <TextInput
                    style={{...styles.textInput, flex: 1, height: "100%"}}
                    placeholder={"Сайт или аккаунт в соц. сети"}
                    value={social}
                    autoCorrect={false}
                    onChangeText={(text) => setSocial(text)}
                />
            </View>
            <Text style={[styles.title, {marginVertical}]}>Адрес</Text>
            <View style={{
                flexDirection: "row",
                height: textInputHeight,
                alignItems: "center",
                marginVertical: marginVertical
            }}>
                <SvgXml xml={iconGeo} style={{marginRight: "1%"}}/>
                <Pressable style={{flex: 1, height: "100%"}} onPress={() => nav.navigate("LocationScreen", {
                    latitude: selectedCoords?.latitude,
                    longitude: selectedCoords?.longitude,
                    edit: true,
                    id: id
                })}>
                    <TextInput
                        style={{...styles.textInput, flex: 1, height: "100%", marginVertical: 0, color: "black"}}
                        placeholder={"Адрес (необязательно)"}
                        value={selectedAddress}
                        autoCorrect={false}
                        editable={false}
                    />
                </Pressable>

            </View>
            <Text>
                На что направлена работа организации?
            </Text>
            <View style={{marginVertical: marginVertical}}>
                <TagSelect
                    value={charity ? charity.tags : undefined}
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
            <Text style={[styles.header]}>Видит только модератор</Text>
            <Text style={[styles.title, {marginVertical: marginVertical}]}>Контакты</Text>
            <TextInput
                style={[styles.textInput, {height: textInputHeight, marginVertical: marginVertical}]}
                value={managerContact}
                placeholder={"Ваш контакт для связи"}
                autoCorrect={false}
                onChangeText={(text) => setManagerContact(text)}
            />
            <Button containerStyle={{marginVertical: marginVertical}} onPress={editCharity} text={"Готово"}
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
    }
})