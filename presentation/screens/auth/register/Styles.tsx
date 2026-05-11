import { StyleSheet } from "react-native";


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ImageBackground: {
        width: '100%',
        height: '100%',
        opacity: 0.2,
    },
    shadowForm:{
        width: '80%',
        height: '75%',
        position: 'absolute',
        top: '27%',
    },
    form: {
        width: 340,
        height: 640,
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        borderRadius: 40,
        
        paddingHorizontal: 25,
       
    },
    lottie: {
        width: 210,
        height: 170,
        alignSelf: 'center',
        marginBottom: 20,
    },
    topImage: {
        width: '100%',
        height: 220,
        position: 'absolute',
        top: 0,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    textLogin: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        alignSelf: 'center',
        position: 'absolute',
        bottom: 110,
    },
    containerDivider: {
        flexDirection: 'row',
        position: 'absolute',
        alignItems: 'center',
        bottom: 70,
        left: 50,
    },
    containerTextDontHaveAccount: {
        flexDirection: 'row',
        position: 'absolute',
        alignItems: 'center',
        bottom: 35,
    },
    textDontHaveAccount: {
        color: 'white',
        fontSize: 15,
    },
    textRegister: {
        color: 'orange',
        fontSize: 15,
        marginLeft: 5,
    },
    divider: {
        height: 1,
        width: '40%',
        backgroundColor: 'white',
        marginHorizontal: 5,
    },
    containerBack: {
        position: 'absolute',
        top: 45,
        left: 20,
    },
    back:{
        width:35,
        height:35,
    }

});

export default styles;