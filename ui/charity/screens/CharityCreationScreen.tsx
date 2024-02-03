import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import React, {useRef, useState} from "react";
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
import {pickPlace} from 'react-native-place-picker';
import {PlacePickerResults} from "react-native-place-picker/src/interfaces";
import {CharityModel} from "../../../data/model/СharityModel";
import {auth} from "../../../firebase/config";
import {useAppDispatch} from "../../../hooks";
import {createCharity} from "../../../redux/slices/charitiesSlice";
import Toast from "react-native-simple-toast";
import {AxiosError} from "axios";
import Spinner from "react-native-loading-spinner-overlay";


const reactNativeTagSelect = require("react-native-tag-select")
const TagSelect = reactNativeTagSelect.TagSelect

export default function CharityCreationScreen() {
    const btns = [{id: 1, title: "Частный сбор"}, {id: 2, title: "НКО"}]
    const [selected, setSelected] = useState<number[]>([1])
    const [name, setName] = useState<string>("")
    const [briefDesc, setBriefDesc] = useState<string>("")
    const [fullDesc, setFullDesc] = useState<string>("")
    const [social, setSocial] = useState<string>("")
    const [checkedTagsCount, setCheckedTagsCount] = useState(0)
    const [fullName, setFullName] = useState<string>("")
    const [ogrn, setOgrn] = useState<string>("")
    const [egrul, setEgrul] = useState<string>("")
    const [managerContact, setManagerContact] = useState<string>("")
    const [selectedAddress, setSelectedAddress] = useState<string | undefined>(undefined);
    const [selectedCoords, setSelectedCoords] = useState<LocationModel | undefined>(undefined);

    const ref = useRef<typeof TagSelect>()
    const screenHeight = useSafeAreaFrame().height;
    const textInputHeight = screenHeight * 0.05
    const marginVertical = screenHeight * 0.01

    const dispatch = useAppDispatch()
    const state = useSelector(selectCharitiesState)
    const nav = useNavigation<any>()

    const getSelectedTags = () => {
        return ref.current!.itemsSelected as TagModel[]
    }

    const resources = useSelector(selectResourceState)
    const handleButtonPress = (buttonId: number) => {
        setSelected([buttonId])
    };

    const selectLocation = () => {
        pickPlace({
            title: "Выберите адрес",
            locale: "ru-RU",
            initialCoordinates: {latitude: 55.753629, longitude: 37.621556},
            enableUserLocation: false,
            searchPlaceholder: "Поиск...",
            color: PRIMARY_COLOR
        }).then((data: PlacePickerResults) => {
            setSelectedAddress(`${data.address?.city ? `г. ${data.address?.city},` : ""} ${data.address?.streetName ? `${data.address?.streetName},` : ""} ${data.address?.name}`)
            setSelectedCoords(data.coordinate)
        }).catch(error => {
            console.log(error)
        })
    }

    const formValid = () => {
        return name.length != 0 &&
            briefDesc.length != 0 &&
            fullDesc.length != 0 &&
            social.length != 0 &&
            checkedTagsCount != 0 &&
            fullName.length != 0 &&
            ogrn.length != 0 &&
            egrul.length != 0 &&
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
            await dispatch(createCharity(charity)).unwrap()
            nav.pop()
        } catch (e) {
            const error = e as AxiosError
            if (error.isAxiosError) {

            }
            Toast.show("Не удалось оствить заявку", Toast.LONG)
        }
    }

    return <ScrollView>

        <Spinner
            visible={state.creationLoading}
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
                placeholder={"Краткое название"}
                autoCorrect={false}
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
                       maxLength={1500}
                       onChangeText={(text) => setBriefDesc(text)}
                       placeholder={"Краткое описание"}/>
            <TextInput multiline={true}
                       style={[styles.textInput, {
                           height: screenHeight * 0.22,
                           textAlignVertical: "top",
                           paddingTop: 2,
                           marginVertical: marginVertical
                       }]}
                       maxLength={1500}
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
                <Pressable style={{flex: 1, height: "100%"}} onPress={selectLocation}>
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
                placeholder={"Полное название"}
                autoCorrect={false}
                onChangeText={(text) => setFullName(text)}
            />
            <TextInput
                style={[styles.textInput, {height: textInputHeight, marginVertical: marginVertical}]}
                placeholder={"ОГРН"}
                autoCorrect={false}
                onChangeText={(text) => setOgrn(text)}
            />
            <TextInput
                style={[styles.textInput, {height: textInputHeight, marginVertical: marginVertical}]}
                placeholder={"ЕГРЮЛ"}
                autoCorrect={false}
                onChangeText={(text) => setEgrul(text)}
            />
            <TextInput
                style={[styles.textInput, {height: textInputHeight, marginVertical: marginVertical}]}
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