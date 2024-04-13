import {TextStyle, ViewStyle} from "react-native";
import {BORDER_COLOR, HYPERLINK_BLUE} from "./colors";

export const textInput: ViewStyle = {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    paddingHorizontal: 5,
    marginVertical: "2%"
}

export const hyperlink: TextStyle = {
    color: HYPERLINK_BLUE,
    textDecorationLine: "underline"
}