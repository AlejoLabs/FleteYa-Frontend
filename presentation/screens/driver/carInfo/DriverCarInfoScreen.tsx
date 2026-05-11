import { View, Text, Image, TouchableOpacity, Alert, ToastAndroid } from "react-native";
import styles from "./Styles";
import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import DefaultTextInput from "../../../components/DefaultTextInput";
import { Ionicons } from "@expo/vector-icons";

export function DriverCarInfoScreen() {

    // const viewModel: ProfileUpdateViewModel = container.resolve('profileUpdateViewModel');
    const [brand, setBrand] = useState('');
    const [plate, setPlate] = useState('');
    const [color, setColor] = useState('');
    const { authResponse, removeAuthSession, saveAuthSession } = useAuth();


    return (
        <View style={styles.container}>
            <View style={styles.boxBackground}>
                <Text style={styles.textBox}>ACTUALIZAR DATOS DE VEHICULO</Text>
            </View>
            <View style={styles.cardUserInfo}>
                <TouchableOpacity onPress={() => { }}>
                    <Image
                        style={styles.imageUser}
                        source={require('../../../../assets/suv.png')}
                    />
                </TouchableOpacity>


                <View style={{ marginLeft: 20, marginRight: 30 }}>
                    <DefaultTextInput
                        placeholder="Marca del Vehiculo"
                        value={brand}
                        onChangeText={setBrand}
                        icon={require('../../../../assets/car.png')}
                        placeholderTextColor="black"
                        textColor="black"
                        borderBottomColor="black"
                    />
                </View>
                <View style={{ marginLeft: 20, marginRight: 30 }}>
                    <DefaultTextInput
                        placeholder="Placa del Vehiculo"
                        value={plate}
                        onChangeText={setPlate}
                        icon={require('../../../../assets/categories.png')}
                        placeholderTextColor="black"
                        textColor="black"
                        borderBottomColor="black"
                    />
                </View>
                <View style={{ marginLeft: 20, marginRight: 30 }}>
                    <DefaultTextInput
                        placeholder="Color"
                        value={color}
                        onChangeText={setColor}
                        icon={require('../../../../assets/comprobado.png')}
                        placeholderTextColor="black"
                        textColor="black"
                        borderBottomColor="black"
                    />
                </View>




            </View>
            <View style={styles.viewActions}>
                <TouchableOpacity style={styles.iconContainer} onPress={() => {
                    // handleUpdateUser();
                }}>
                    <View style={styles.iconBox}>
                        <Ionicons name='pencil' size={25} color='white' />
                    </View>
                    <Text style={styles.textAction}>EDITAR VEHICULO</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}