import {LocationProps} from "../../../Navigate";
import { View} from "react-native";
import LocationView from "react-native-location-view/index";
import {LocationModel as MapLocation} from "react-native-location-view/interface/LocationModel";
import {PRIMARY_COLOR} from "../../../styles/colors";
import React from "react";
import {useNavigation} from "@react-navigation/native";

export default function CharityLocationScreen({route: {params: {latitude, longitude, edit, id}}}: LocationProps) {

    const nav = useNavigation<any>()

    return <View style={{
        flex: 1,
        width: "100%",
        alignSelf: "center",
        justifyContent: "center",
    }}>
        <LocationView
            apiKey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY}
            initialLocation={{
                latitude: latitude ? latitude : 55.753629, longitude: longitude ? longitude : 37.621556,
            }}
            onLocationSelect={(data: MapLocation) => nav.navigate(edit ? "CharityEdit" : "CreateCharity", {location: data, id: id})}
            markerColor={PRIMARY_COLOR}
        />
    </View>
}
