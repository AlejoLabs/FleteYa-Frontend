import {View, Image, Text} from "react-native";
import { Role } from "../../../domain/models/Role";
import styles from "./Styles";


interface Props {
    role: Role;
}

export default function RolesItem({role}: Props) {
    return (
        <View>
            <Image 
                style={styles.image}
                source={{ uri: role.image}}
            />
            <Text style={styles.textItem}>{role.name}</Text>
        </View>
    );
}