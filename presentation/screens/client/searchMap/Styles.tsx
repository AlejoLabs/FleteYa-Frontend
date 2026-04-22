import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: "100%",
        height: "100%",
    },
    placeAutocomplete: {
        position: "absolute",
        zIndex: 1,
        top: 50,
        left: 10,
        right: 10,
    },

});

export default styles;