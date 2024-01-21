import {Pressable, StyleSheet, Text, View} from 'react-native';

export default function PagerTitle({firstLabel, secondLabel, selected, onSelect}: {
    firstLabel: string,
    secondLabel: string,
    selected: number,
    onSelect: (id: 1 | 2) => void;
}) {
    return (
        <View style={styles.container}>
            <Pressable style={{padding: 20}} onPress={() => onSelect(1)}>
                <Text style={[selected == 1 ? styles.selectedTextStyle : styles.unselectedTextStyle]}>{firstLabel}</Text>
                {selected == 1 && <View style={styles.line}/>}
            </Pressable>

            <Pressable style={{padding: 20}} onPress={() => onSelect(2)}>
                <Text style={[selected == 2 ? styles.selectedTextStyle : styles.unselectedTextStyle]}>{secondLabel}</Text>
                {selected == 2 && <View style={styles.line}/>}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flexDirection: "row",
        justifyContent: "space-between",
        width: "90%"
    },
    selectedTextStyle: {
        marginBottom: 4,
        color: "#3A7354"
    },
    unselectedTextStyle: {
        marginBottom: 4,
        color: "#8ABEAA"
    },
    line: {
        borderBottomWidth: 1.5,
        borderBottomColor: '#3A7354'
    }
});
