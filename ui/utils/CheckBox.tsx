
import { Pressable, StyleSheet } from 'react-native';
import {BUTTON_ACTIVE_COLOR} from "../../styles/colors";
import { Ionicons } from '@expo/vector-icons';
import React from "react";

export function Checkbox({ onChange, checked } : {
    onChange?: (() => void) | undefined
    checked: boolean
}) {
    return (
        <Pressable
            style={[styles.checkboxBase, checked && styles.checkboxChecked]}
            onPress={onChange}>
            {checked && <Ionicons name="checkmark" size={20} color="white" />}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    checkboxBase: {
        borderRadius: 100,
        height: 24,
        width: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "rgba(151,195,243,0.35)"
    },
    checkboxChecked: {
        backgroundColor: BUTTON_ACTIVE_COLOR
    }
})