import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import React, {useEffect, useRef, useState} from "react";
import ButtonRow from "../../profile/components/ButtonRow";
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
import {CharityModel} from "../../../data/model/СharityModel";
import {auth} from "../../../firebase/config";
import {useAppDispatch} from "../../../hooks";
import {createCharity, editCharity} from "../../../redux/slices/charitiesSlice";
import Toast from "react-native-simple-toast";
import {AxiosError} from "axios";
import Spinner from "react-native-loading-spinner-overlay";
import {CreateCharityProps} from "../../../Navigate";


const reactNativeTagSelect = require("react-native-tag-select")
const TagSelect = reactNativeTagSelect.TagSelect

export default function CharityCreationScreen({route: {params: {charity: existingCharity, location, id}}}: CreateCharityProps) {

    const btns = [{id: 1, title: "Частный сбор"}, {id: 2, title: "НКО"}]
    const [selected, setSelected] = useState<number[]>(existingCharity ? existingCharity.organization ? [2] : [1] : [1])
    const [name, setName] = useState<string>(existingCharity ? existingCharity.name : "")
    const [briefDesc, setBriefDesc] = useState<string>(existingCharity ? existingCharity.briefDescription : "")
    const [fullDesc, setFullDesc] = useState<string>(existingCharity ? existingCharity.description : "")
    const [social, setSocial] = useState<string>(existingCharity ? existingCharity.url ? existingCharity.url : "" : "")
    const [checkedTagsCount, setCheckedTagsCount] = useState(existingCharity ? existingCharity.tags.length : 0)
    const [fullName, setFullName] = useState<string>(existingCharity ? existingCharity.fullName : "")
    const [ogrn, setOgrn] = useState<string>(existingCharity ? existingCharity.ogrn : "")
    const [egrul, setEgrul] = useState<string>(existingCharity ? existingCharity.egrul : "")
    const [managerContact, setManagerContact] = useState<string>(existingCharity ? existingCharity.managerContact : "")
    const [selectedAddress, setSelectedAddress] = useState<string | undefined>(existingCharity ? existingCharity.address ? existingCharity.address : undefined : undefined);
    const [selectedCoords, setSelectedCoords] = useState<LocationModel | undefined>(existingCharity ? existingCharity.location ? existingCharity.location : undefined : undefined);

    const ref = useRef<typeof TagSelect>()
    const screenHeight = useSafeAreaFrame().height;
    const textInputHeight = screenHeight * 0.05
    const marginVertical = screenHeight * 0.01

    const dispatch = useAppDispatch()
    const state = useSelector(selectCharitiesState)
    const nav = useNavigation<any>()

    useEffect(() => {
        if (location) {
            setSelectedCoords({latitude: location.latitude, longitude: location.longitude})
            setSelectedAddress(location.address)
        }
    }, [location]);

    const getSelectedTags = () => {
        return ref.current!.itemsSelected as TagModel[]
    }

    const resources = useSelector(selectResourceState)
    const handleButtonPress = (buttonId: number) => {
        setSelected([buttonId])
    };

    const handleOgrnChange = (text: string) => {
        if (/^\d+$/.test(text) || text === '') {
            setOgrn(text);
        }
    };

    const handleEgrulChange = (text: string) => {
        if (/^\d+$/.test(text) || text === '') {
            setEgrul(text);
        }
    };

    const formValid = () => {
        return name.length != 0 &&
            briefDesc.length != 0 &&
            fullDesc.length != 0 &&
            social.length != 0 &&
            checkedTagsCount != 0 &&
            fullName.length != 0 &&
            (selected[0] !== 2 || (ogrn.length == 13 && egrul.length == 15)) &&
            managerContact.length != 0
    }

    const requestCreateCharity = async () => {
        const charity: CharityModel = {
            address: selectedAddress,
            briefDescription: briefDesc,
            campaigns: [],
            confirmed: false,
            creatorid: auth.currentUser!!.uid,
            description: fullDesc,
            egrul: egrul,
            fullName: fullName,
            location: selectedCoords,
            managerContact: managerContact,
            name: name,
            ogrn: ogrn,
            organization: selected[0] == 2,
            photourl: undefined,
            tags: getSelectedTags(),
            url: social
        }
        try {
            if (id) {
                charity.id = id
                await dispatch(editCharity(charity)).unwrap()
            } else {
                await dispatch(createCharity(charity)).unwrap()
            }
            nav.pop()
        } catch (e) {
            const error = e as AxiosError
            if (error.isAxiosError) {

            }
            console.log(error)
            Toast.show("Не удалось оствить заявку", Toast.LONG)
        }
    }

    return <ScrollView>

        <Spinner
            visible={state.editLoading}
            textContent={'Создание заявки...'}
            textStyle={{color: "white"}}
        />
        <View style={styles.container}>
            <Text style={[styles.header]}>Информация об организации</Text>
            <ButtonRow data={btns} onPress={handleButtonPress} selected={selected}
                       buttonContainerStyle={{width: "40%", alignItems: "center"}}/>
            <Text style={[styles.title, {marginVertical}]}>Для благотворителей</Text>
            <TextInput
                style={[styles.textInput, {height: textInputHeight, marginVertical: marginVertical}]}
                placeholder={"Краткое название (нельзя будет изменить)"}
                autoCorrect={false}
                value={name}
                maxLength={70}
                onChangeText={(text) => setName(text)}
            />
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
                    edit: false,
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
                    value={existingCharity ? existingCharity.tags : undefined}
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
            <Text style={[styles.title, {marginVertical: marginVertical}]}>Для регистрации на платформе</Text>
            <TextInput
                style={[styles.textInput, {height: textInputHeight, marginVertical: marginVertical}]}
                value={fullName}
                placeholder={"Полное название"}
                autoCorrect={false}
                onChangeText={(text) => setFullName(text)}
            />
            {
                selected[0] === 2 && (
                    <>
                        <TextInput
                            style={[styles.textInput, {height: textInputHeight, marginVertical: marginVertical}]}
                            value={ogrn}
                            placeholder={"ОГРН"}
                            autoCorrect={false}
                            maxLength={13}
                            onChangeText={(text) => handleOgrnChange(text)}
                        />
                        <TextInput
                            style={[styles.textInput, {height: textInputHeight, marginVertical: marginVertical}]}
                            value={egrul}
                            placeholder={"ЕГРЮЛ"}
                            autoCorrect={false}
                            maxLength={15}
                            onChangeText={(text) => handleEgrulChange(text)}
                        />
                    </>
                )
            }
            <TextInput
                style={[styles.textInput, {height: textInputHeight, marginVertical: marginVertical}]}
                value={managerContact}
                placeholder={"Ваш контакт для связи"}
                autoCorrect={false}
                onChangeText={(text) => setManagerContact(text)}
            />
            <Button containerStyle={{marginVertical: marginVertical}} onPress={requestCreateCharity} text={"Готово"}
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