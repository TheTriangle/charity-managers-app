import {StyleSheet, Text, View} from 'react-native';
import {PRIMARY_COLOR} from "../../../styles/colors";
import {CharityModel} from "../../../data/model/СharityModel";
import {TouchableOpacity} from "react-native-gesture-handler";

export default function CharityListItem({charity, onPress}: {
    charity: CharityModel,
    onPress: (charity: CharityModel) => void
}) {
    return (
        <TouchableOpacity onPress={() => onPress(charity)} style={[styles.container, charity.requestedDeletion && {backgroundColor: "#ffd8d8"}]}>
            <Text style={styles.label}>{charity.name}</Text>
            <Text style={{marginBottom: 10}}>{charity.briefDescription}</Text>
            <View style={styles.buttonContainer}>
                <Text style={styles.buttonText}>Открыть</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        alignItems: 'flex-start',
        padding: "4%",
        borderRadius: 10,
        shadowRadius: 3,
        shadowOffset: {width: 3, height: 3},
        shadowColor: "black",
        shadowOpacity: 0.5,
        elevation: 3,
        marginHorizontal: 4
    },
    label: {
        alignSelf: "flex-start",
        fontWeight: "800",
        fontSize: 20,
    },
    buttonContainer: {
        borderRadius: 30,
        backgroundColor: PRIMARY_COLOR,
        paddingHorizontal: 40,
        paddingVertical: 2
    },
    buttonText: {
        color: "white",
        fontWeight: "500"
    }
});
