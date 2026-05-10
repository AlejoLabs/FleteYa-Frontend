import { StackScreenProps } from "@react-navigation/stack";
import { Text, View } from "react-native";
import { ClientMapStackParamList } from "../../../navigator/ClientMapStackNavigator";

interface Props extends StackScreenProps<ClientMapStackParamList, 'ClientTripMapScreen'> { };
export function ClientTripMapScreen({navigation, route}: Props) {
    const { idClientRequest } = route.params;
    console.log('PARAMETRO CONDUCTOR', idClientRequest);
    return(
        <View>
            <Text>ClientTripMapScreen</Text>
        </View>
    )
}