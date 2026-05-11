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
        backgroundColor: "#df9138",
        borderRadius: 10,
        justifyContent: "center",
        paddingLeft: 20,
    },
    timeAndDistanceText: {
        color: "white",
        fontSize: 15,
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
        paddingBottom: 16,
    },
    viewDecoration: {
        backgroundColor: "black",
        width: "100%",
        height: 50,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        justifyContent: "center",
        paddingLeft: 20,
    },
    textDecoration: {
        color: "white",
    },
    infoContainer: {
        backgroundColor: "rgba(240, 240, 240)",
        height: 40,
        justifyContent: "center",
        paddingLeft: 20,
        marginBottom: 10,
        borderRadius: 10,
    }

});

export default styles;