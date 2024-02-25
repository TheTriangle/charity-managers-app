import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import PagerTitle from "../components/PagerTitle";
import React, {useEffect, useRef, useState} from "react";
import {BACKGROUND_COLOR, PRIMARY_COLOR} from "../../../styles/colors";
import {FlatList} from "react-native-gesture-handler";
import CharityListItem from "../../charity/components/CharityListItem";
import PagerView from "react-native-pager-view";
import {useAppDispatch} from "../../../hooks";
import {getCharities} from "../../../redux/slices/charitiesSlice";
import {useSelector} from "react-redux";
import {selectCharitiesState} from "../../../redux/selectors";
import Button from "../../utils/Button";
import {AntDesign} from '@expo/vector-icons';
import {useNavigation} from "@react-navigation/native";

export default function OrganizationsScreen() {
    const [page, setPage] = useState<number>(0)
    const pagerRef = useRef<PagerView>(null);
    const state = useSelector(selectCharitiesState)
    const dispatch = useAppDispatch()
    const nav = useNavigation<any>()

    useEffect(() => {
        dispatch(getCharities())
    }, []);

    const changePage = (pageNum: number) => {
        setPage(pageNum)
        if (pagerRef.current) {
            pagerRef.current.setPage(pageNum)
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Мои организации</Text>
            <PagerTitle selected={page} firstLabel={"Одобренные"} secondLabel={"Заявки"} onSelect={changePage}/>
            {
                state.loading ?
                    <View style={{flex: 1, justifyContent: "center"}}>
                        <ActivityIndicator size={"large"} style={{alignSelf: "center"}}/>
                    </View>
                    : state.error == null ?
                        <PagerView style={{flex: 1, width: "100%"}} ref={pagerRef} initialPage={0}
                                   onPageSelected={event => {
                                       setPage(event.nativeEvent.position)
                                   }}>
                            <View key="1">
                                {
                                    state.confirmedCharities.length == 0 ?
                                        <View style={{flex: 1, justifyContent: "center", alignSelf: "center"}}>
                                            <Text style={styles.hintText}>Нет одобренных организаций</Text>
                                        </View>
                                        :
                                        <FlatList style={{width: "100%"}} data={state.confirmedCharities}
                                                  renderItem={(item => {
                                                      return <CharityListItem charity={item.item}
                                                                              onPress={(charity) => {
                                                                                  nav.navigate("Charity", {charity: charity})
                                                                              }}/>
                                                  })}
                                                  ItemSeparatorComponent={() => <View style={{height: 20}}/>}
                                        />
                                }
                            </View>
                            <View key="2">
                                {
                                    state.unconfirmedCharities.length == 0 ?
                                        <View style={{flex: 1, justifyContent: "center", alignSelf: "center"}}>
                                            <Text style={styles.hintText}>Нет заявок на добавление</Text>
                                            <Button onPress={() => nav.navigate("CreateCharity", {})} text={"Создать"}/>
                                        </View>
                                        :
                                        <>
                                            <FlatList style={{width: "100%"}} data={state.unconfirmedCharities}
                                                      renderItem={(({item}) => {
                                                          return <CharityListItem charity={item}
                                                                                  onPress={(charity) => {
                                                                                      nav.navigate("CreateCharity", {charity: charity})
                                                                                  }}/>
                                                      })}
                                                      ItemSeparatorComponent={() => <View style={{height: 20}}/>}
                                            />
                                            <AntDesign style={{position: "absolute", right: 10, bottom: 10}}
                                                       name="pluscircle" size={54} color={PRIMARY_COLOR} onPress={() => nav.navigate("CreateCharity", {})}/>
                                        </>

                                }
                            </View>
                        </PagerView>
                        :
                        <View style={{flex: 1, justifyContent: "center"}}>
                            <Text style={[styles.hintText, {alignSelf: "center"}]}>Ошибка получения данных</Text>
                            <Button onPress={() => dispatch(getCharities())} text={"Попробовать снова"}/>
                        </View>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND_COLOR,
        alignItems: 'center',
        padding: "4%"
    },
    label: {
        alignSelf: "flex-start",
        fontWeight: "700",
        fontSize: 30,
        color: "#2E5C40",
    },
    hintText: {
        fontWeight: "700",
        fontSize: 18,
        marginBottom: 10
    }
});
