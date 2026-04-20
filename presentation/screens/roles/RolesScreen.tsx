import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigator/MainStackNavigator";
import { View, FlatList, Text } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import styles from "./Styles";
import RolesItem from "./RolesItem";

interface Props extends StackScreenProps<RootStackParamList, 'RolesScreen'> { };

export default function RolesScreen({ navigation, route }: Props) {
    
    const {authResponse} = useAuth();

    return (
        <View style={styles.container}>
            <FlatList
                contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}
                data={authResponse?.user.roles}
                keyExtractor={(item) => item.id}
                renderItem= {({item}) => <RolesItem role={item} navigation={navigation} />}
            />
        </View>
    );
}