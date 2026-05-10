import { StackScreenProps } from "@react-navigation/stack";
import { Text, View } from "react-native";
import { DriverMapStackParamList } from "../../../navigator/DriverMapStackNavigator";

interface Props extends StackScreenProps<DriverMapStackParamList, 'DriverTripRatingScreen'>{}

export function DriverTripRatingScreen({navigation, route}: Props){

    const { clientRequest }  = route.params;
    console.log('CONDUCTOR PARAMETRO CLIENT REQUEST:', clientRequest);
    return (
        <View>
            <Text>DriverTripRatingScreen</Text>
        </View>
    );
}