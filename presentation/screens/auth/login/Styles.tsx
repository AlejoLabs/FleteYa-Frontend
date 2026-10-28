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
        width: '72%',
        height: '75%',
        position: 'absolute',
        top: '35%',
    },
    form: {
        width: 300,
        height: 450,
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        borderRadius: 40,
        
        paddingHorizontal: 25,
       
    },
    // Más baja que antes para que el botón de Google quepa dentro de la tarjeta
    lottie: {
        width: 180,
        height: 120,
        alignSelf: 'center',
        marginBottom: 10,
    },
    topImage: {
        width: '100%',
        height: 280,
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
    // Área de toque más grande que el texto, en el mismo lugar donde estaba el texto suelto
    forgotLink: {
        alignSelf: 'center',
        position: 'absolute',
        bottom: 100,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: 'white',
        marginTop: 12,
    },
    googleG: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4285F4',
        marginRight: 10,
    },
    googleText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    linkOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: 24,
    },
    linkCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
    },
    linkTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkText: {
        color: '#444',
        marginTop: 8,
        marginBottom: 12,
    },
    linkInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: '#f7f7f7',
        color: 'black',
    },
    textForgot: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
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
});

export default styles;