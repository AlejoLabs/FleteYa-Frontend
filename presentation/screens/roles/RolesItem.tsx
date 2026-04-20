import {View, Image, Text, TouchableOpacity} from "react-native";
import { Role } from "../../../domain/models/Role";
import styles from "./Styles";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigator/MainStackNavigator";


interface Props {
    navigation: StackNavigationProp<RootStackParamList, 'RolesScreen', undefined>,
    role: Role
}

export default function RolesItem({navigation, role}: Props) {
    return (
        <TouchableOpacity
            onPress={() => {
                if (role.id === 'CLIENT') {
                    navigation.replace('ClientHomeScreen');
                }
                else if (role.id === 'DRIVER') {
                    navigation.replace('DriverHomeScreen');
                }
            }}
        >
            <View>
            <Image 
                style={styles.image}
                source={{ uri: role.image}}
            />
            <Text style={styles.textItem}>{role.name}</Text>
        </View>
        </TouchableOpacity>
        
    );
}