import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageClient: {
        width: 50,
        height: 50,
        borderRadius: 50
    },
    itemContainer: {
        backgroundColor: 'white',
        elevation: 2,
        marginTop: 10,
        marginLeft: 15,
        marginRight: 15,
        padding: 15,
        borderRadius: 15,
    },
    mainInfoContainer: {
        flexDirection: 'row',
    },
    mainTextContainer: {
        width: '85%',
    },
    textDataTrip: {
        color: 'red',
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 10,
    },
    textMainInfo: {
        fontSize: 20,
        fontWeight: 'bold',

    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
    },
    modalContent: {
        backgroundColor: "white",
        borderRadius: 20,
        marginLeft: 20,
        marginRight: 20,
        
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
    actionsRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    actionButton: {
        flex: 1,
        height: 46,
        borderRadius: 23,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
    },
    stepperRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 14,
    },
    stepperButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#eee',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepperText: {
        fontSize: 26,
        fontWeight: 'bold',
    },
    counterFare: {
        fontSize: 26,
        fontWeight: 'bold',
        minWidth: 160,
        textAlign: 'center',
    },
});

export default styles;
