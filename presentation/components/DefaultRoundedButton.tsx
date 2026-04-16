import {StyleSheet, Text, TouchableOpacity} from "react-native"

interface Props {
    text: string,
    onPress: () => void,
    backgroundColor?: string
}

const DefaultRoundedButton = ({ text, onPress, backgroundColor}: Props) => {
    return (
        <TouchableOpacity 
            style={[styles.roundedButton,{backgroundColor: backgroundColor || 'red'}]}
            onPress={()=> onPress()}
        >
            <Text style={styles.textButton}>{text}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    roundedButton:{
        width: '100%',
        height: 55,
        backgroundColor: 'red',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
        marginTop: 25
  },
  textButton: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold'
  }
})

export default DefaultRoundedButton;