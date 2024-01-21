import {StyleSheet, Text, View} from 'react-native';
import PagerTitle from "../components/PagerTitle";
import {useState} from "react";
import {BACKGROUND_COLOR} from "../../../styles/colors";

export default function OrganizationsScreen() {
    const [page, setPage] = useState<1 | 2>(1)
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Мои организации</Text>
            <PagerTitle selected={page} firstLabel={"Одобренные"} secondLabel={"Заявки"} onSelect={setPage}/>
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
    }
});
