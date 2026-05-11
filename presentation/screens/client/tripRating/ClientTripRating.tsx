import { Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import { ClientMapStackParamList } from "../../../navigator/ClientMapStackNavigator";
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import StarRating from "@empglabs/react-native-star-rating-widget";
import styles from "./Styles";
import { useState } from "react";
import { container } from "../../../../di/container";
import { ClientTripRatingViewModel } from "./ClientTripRatingViewModel";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../../navigator/MainStackNavigator";

interface Props extends StackScreenProps<ClientMapStackParamList, 'ClientTripRatingScreen'>{}

export function ClientTripRatingScreen({navigation, route}: Props){

    const { clientRequest }  = route.params;
    console.log('CLIENTE PARAMETRO CLIENT REQUEST:', clientRequest);
    const rootNavigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const viewModel : ClientTripRatingViewModel = container.resolve('clientTripRatingViewModel');
    const [rating, setRating] = useState(0);
    console.log('CONDUCTOR PARAMETRO CLIENT REQUEST:', clientRequest);

    const handleUpdateDriverRating = async () => {
        const response = await viewModel.updateDriverRating(clientRequest.id, rating);
        if(typeof response === 'boolean' ){
            ToastAndroid.show('Calificación actualizada', ToastAndroid.LONG);
            rootNavigation.replace('ClientHomeScreen');
        }
    }

    return (
        <View style={styles.container}>
            <Ionicons
                style={styles.iconCheck}
                name="checkmark-circle"
                size={100}
            />
            <Text style={styles.textTripFinished}>TU VIAJE HA FINALIZADO</Text>
            <View style={styles.rowContainer}>
                <Ionicons
                    name="location"
                    size={25}
                />
                <View style={styles.textDescription}>
                    <Text style={styles.bold}>DESDE</Text>
                    <Text>{clientRequest.pickup_description}</Text>
                </View>
            </View>
            <View style={styles.rowContainer}>
                <Ionicons
                    name="home"
                    size={25}
                />
                <View style={styles.textDescription}>
                    <Text style={styles.bold}>HASTA</Text>
                    <Text>{clientRequest.destination_description}</Text>
                </View>
            </View>
            <Text style={styles.textFare}>VALOR DEL VIAJE</Text>
            <Text style={styles.textFareValue}>${clientRequest.fare_offered}</Text>
            <Text style={styles.textRating}>CALIFICA A TU CONDUCTOR</Text>
            <StarRating
                style={styles.starRating}
                maxStars={5}
                rating={rating}
                onChange={setRating}
            />
            <View style={{flex: 1}}></View>
            <TouchableOpacity style={styles.iconContainer} onPress={() => {
                handleUpdateDriverRating();
            }}>
                <View style={styles.iconBox}>
                    <Ionicons name='checkmark' size={25} color='white' />
                </View>
                <Text style={styles.textAction}>CALIFICAR CONDUCTOR</Text>
            </TouchableOpacity>
        </View>
    );
}