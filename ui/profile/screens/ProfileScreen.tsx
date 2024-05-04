import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from "react";
import {useAppDispatch} from "../../../hooks";
import {signOut} from "../../../redux/slices/authSlice";
import Button from "../../utils/Button";



export default function ProfileScreen() {

    const dispatch = useAppDispatch()

    return (
        <View style={styles.container}>
        <Text>Profile</Text>
            <Button onPress={() => dispatch(signOut())} text={"Выйти"}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
