import { StackScreenProps } from "@react-navigation/stack";
import { Text, TouchableOpacity, View } from "react-native";
import { DriverMapStackParamList } from "../../../navigator/DriverMapStackNavigator";
import styles from "./Styles";
import { Ionicons } from "@expo/vector-icons";
import StarRating from "@empglabs/react-native-star-rating-widget";
import { useState } from "react";

interface Props extends StackScreenProps<DriverMapStackParamList, 'DriverTripRatingScreen'> { }

export function DriverTripRatingScreen({ navigation, route }: Props) {

    const { clientRequest } = route.params;
    const [rating, setRating] = useState(0);
    console.log('CONDUCTOR PARAMETRO CLIENT REQUEST:', clientRequest);
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
            <Text style={styles.textRating}>CALIFICA A TU CLIENTE</Text>
            <StarRating
                style={styles.starRating}
                maxStars={5}
                rating={rating}
                onChange={setRating}
            />
            <View style={{flex: 1}}></View>
            <TouchableOpacity style={styles.iconContainer} onPress={() => {

            }}>
                <View style={styles.iconBox}>
                    <Ionicons name='checkmark' size={25} color='white' />
                </View>
                <Text style={styles.textAction}>CALIFICAR CLIENTE</Text>
            </TouchableOpacity>
        </View>
    );
}