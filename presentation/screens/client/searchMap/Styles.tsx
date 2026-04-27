import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
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
    placeDestinationAutocomplete: {
        position: "absolute",
        zIndex: 1,
        top: 100,
        left: 10,
        right: 10,
    },
    pinImage: {
    },
    timeAndDistanceView: {
        width: "100%",
        height: 70,
        backgroundColor: "yellow",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        height: '90%',
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
    }

});

export default styles;