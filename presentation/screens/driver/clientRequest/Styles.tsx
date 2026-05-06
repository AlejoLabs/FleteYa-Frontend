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
        height: 220,
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

    }
});

export default styles;
