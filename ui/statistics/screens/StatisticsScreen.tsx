import {
    ScrollView,
    StyleSheet,
    View,
    Text
} from "react-native";
import React, {useEffect} from "react";
import {StatisticsProps} from "../../../Navigate";
import Button from "../../utils/Button";
import {useSelector} from "react-redux";
import {selectStatisticsState} from "../../../redux/selectors";
import {useAppDispatch} from "../../../hooks";
import Toast from "react-native-simple-toast";
import Spinner from "react-native-loading-spinner-overlay";
import {getStatistics} from "../../../redux/slices/statisticsSlice";
import {LineChart} from "react-native-chart-kit";
import {useSafeAreaFrame} from "react-native-safe-area-context";
import {PRIMARY_COLOR} from "../../../styles/colors";

export default function StatisticsScreen({route: {params: {id, isCampaign}}}: StatisticsProps) {

    const state = useSelector(selectStatisticsState)
    const dispatch = useAppDispatch()
    const screenHeight = useSafeAreaFrame().height

    const fetchStats = async () => {
        try {
            await dispatch(getStatistics({id: id, isCampaign: isCampaign})).unwrap()
        } catch (e) {
            console.log(e)
            Toast.show("Could not load statistics", Toast.LONG)
        }
    }

    const subscribersData = {
        labels: state.subscribersStats.month,
        datasets: [
            {
                data: state.subscribersStats.count,
            }
        ],
    };

    const donationsData = {
        labels: state.collectedAmountStats.month,
        datasets: [
            {
                data: state.collectedAmountStats.amount,
            }
        ],
    };

    const chartConfig = {
        backgroundGradientFrom: "#919191",
        backgroundGradientFromOpacity: 0,
        backgroundGradientTo: "#919191",
        backgroundGradientToOpacity: 0.5,
        color: (opacity = 1) => PRIMARY_COLOR,
        strokeWidth: 2, // optional, default 3
        barPercentage: 0.5,
    };

    useEffect(() => {
        fetchStats()
    }, []);

    return <ScrollView style={{flex: 1}} contentContainerStyle={styles.container}>
        <Spinner
            visible={state.loading}
            textContent={'Loading...'}
            textStyle={{color: "white"}}
        />

        {state.error == null ?
            !state.loading && <View>
                <Text style={styles.title}>Unique donors: <Text
                    style={{fontWeight: "400"}}>{state.uniqueDonorsOverall}</Text></Text>
                <Text style={styles.title}>Unique donors last month: <Text
                    style={{fontWeight: "400"}}>{state.uniqueDonorsMonth}</Text></Text>
                <Text style={styles.title}>Unique donors based on month</Text>
                <LineChart
                    data={subscribersData}
                    width={useSafeAreaFrame().width}
                    height={screenHeight * 0.35}
                    chartConfig={chartConfig}
                />

                <Text style={styles.title}>Collected amount each month</Text>
                <LineChart
                    data={donationsData}
                    width={useSafeAreaFrame().width}
                    height={screenHeight * 0.35}
                    chartConfig={chartConfig}
                />
            </View>
            :
            !state.loading && <Button onPress={fetchStats} text={"Try again"}/>
        }

    </ScrollView>

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: "4%",
    },
    title: {
        fontWeight: "600",
        fontSize: 18,
        marginVertical: "2%"
    },
})