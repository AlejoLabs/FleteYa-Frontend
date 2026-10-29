import { useState } from "react";
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { DriverMapStackParamList } from "../../../navigator/DriverMapStackNavigator";
import { RootStackParamList } from "../../../navigator/MainStackNavigator";
import { container } from "../../../../di/container";
import { useToast } from "../../../components/ui";
import { formatErrorMessage } from "../../../utils/Formatters";
import TripRatingView from "../../trip/rating/TripRatingView";
import { DriverTripRatingViewModel } from "./DriverTripRatingViewModel";

interface Props extends StackScreenProps<DriverMapStackParamList, 'DriverTripRatingScreen'> { }

// El conductor califica al cliente al entregar la carga
export function DriverTripRatingScreen({ navigation, route }: Props) {

    const { clientRequest } = route.params;
    const rootNavigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const viewModel: DriverTripRatingViewModel = container.resolve('driverTripRatingViewModel');
    const { showToast } = useToast();
    const [sending, setSending] = useState(false);

    const handleSubmit = async (rating: number) => {
        const error = viewModel.validate(rating);
        if (error) {
            showToast(error, 'error');
            return;
        }
        setSending(true);
        const response = await viewModel.updateClientRating(clientRequest.id, rating);
        setSending(false);
        if (typeof response === 'boolean') {
            showToast('¡Gracias por calificar!', 'success');
        } else {
            showToast(formatErrorMessage(response.message), 'error');
            // 409: ya estaba calificado, así que igual se sale
            if (response.statusCode !== 409) return;
        }
        rootNavigation.replace('DriverHomeScreen');
    }

    return (
        <TripRatingView
            request={clientRequest}
            person={clientRequest.client}
            fareLabel="Lo que cobras por este flete"
            sending={sending}
            onSubmit={handleSubmit}
            onReport={() => navigation.navigate('IncidentReportScreen', { idClientRequest: clientRequest.id })}
        />
    );
}
