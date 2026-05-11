import { StyleSheet } from "react-native";
import { container } from "../../../../di/container";

const styles = StyleSheet.create({
    container:{
        flex: 1,
    },
    rowContainer:{
        flexDirection: 'row',
        marginTop: 15,
        marginLeft: 15,
        marginRight: 15,
        alignItems: 'center',
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 100,
        marginBottom: 40,

    },
    iconBox: {
        width: 45,
        height: 45,
        borderRadius: 50,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textAction: {
        fontWeight: 'bold',
        fontSize: 17,
        marginLeft: 7,
    },
    iconCheck: {
        alignSelf: 'center',

    },
    textTripFinished: {
        alignSelf: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
    },
    textDescription: {
        marginLeft: 10,
        paddingRight: 20,
    },
    bold: {
        fontWeight: 'bold',
    },
    textFare: {
        alignSelf: 'center',
        fontWeight: 'bold',
        fontSize: 18,
        marginTop: 50
    },
    textFareValue: {
        color : 'green',
        fontSize: 25,
        fontWeight: 'bold',
        alignSelf: 'center',
    },
    textRating: {
        alignSelf: 'center',
        fontWeight: 'bold',
        fontSize: 18,
        marginTop: 20
    },
    starRating: {
        alignSelf: 'center',
        marginTop: 5,
    }

});

export default styles;