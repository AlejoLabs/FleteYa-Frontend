import { Text, View } from "react-native";
import { ClientMapStackParamList } from "../../../navigator/ClientMapStackNavigator";
import { StackScreenProps } from "@react-navigation/stack";

interface Props extends StackScreenProps<ClientMapStackParamList, 'ClientTripRatingScreen'>{}

export function ClientTripRatingScreen({navigation, route}: Props){

    const { clientRequest }  = route.params;
    console.log('CLIENTE PARAMETRO CLIENT REQUEST:', clientRequest);

    return (
        <View>
            <Text>ClientTripRatingScreen</Text>
        </View>
    );
}