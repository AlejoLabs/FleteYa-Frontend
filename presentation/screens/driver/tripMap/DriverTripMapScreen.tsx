import { StackScreenProps } from "@react-navigation/stack";
import { Text, View } from "react-native";
import { DriverMapStackParamList } from "../../../navigator/DriverMapStackNavigator";

interface Props extends StackScreenProps<DriverMapStackParamList, 'DriverTripMapScreen'> { };
export function DriverTripMapScreen({navigation, route}: Props) {
    const { idClientRequest } = route.params;
    console.log('PARAMETRO CLIENTE', idClientRequest);
    return(
        <View>
            <Text>DriverTripMapScreen</Text>
        </View>
    );
}