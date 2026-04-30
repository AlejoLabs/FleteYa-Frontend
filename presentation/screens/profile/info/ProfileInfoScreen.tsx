import { View, Text, Image } from "react-native";
import styles from "./Styles";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileInfoScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.boxBackground}>
                <Text style={styles.textBox}>PERFIL DE USUARIO</Text>
            </View>
            <View style={styles.cardUserInfo}>
                <Image 
                    style={styles.imageUser}
                    source={require('../../../../assets/user_image.png')}
                
                />
                <Text style={styles.textUsername}>Nombre de Usuario</Text>
                <Text style={styles.textEmail}>Correo Electronico</Text>
                <Text style={styles.textPhone}>+57 0000000000</Text>
                
            </View>
            <View style={styles.viewActions}>
                <View style={styles.iconContainer}>
                    <View style={styles.iconBox}>
                        <Ionicons name='pencil' size={25} color='white' />
                    </View>
                    <Text style={styles.textAction}>EDITAR PERFIL</Text>
                </View>
                <View style={styles.iconContainer}>
                    <View style={styles.iconBox}>
                        <Ionicons name='exit-outline' size={25} color='white' />
                    </View>
                    <Text style={styles.textAction}>CERRAR SESION</Text>
                </View>
            </View>
        </View>
    )
}