import { useState } from "react";
import { StackNavigationProp, StackScreenProps } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { ClientMapStackParamList } from "../../../navigator/ClientMapStackNavigator";
import { RootStackParamList } from "../../../navigator/MainStackNavigator";
import { container } from "../../../../di/container";
import { useToast } from "../../../components/ui";
import { formatErrorMessage } from "../../../utils/Formatters";
import TripRatingView from "../../trip/rating/TripRatingView";
import { ClientTripRatingViewModel } from "./ClientTripRatingViewModel";
import { useTranslation } from 'react-i18next';
import { t } from '../../../../i18n';

interface Props extends StackScreenProps<ClientMapStackParamList, 'ClientTripRatingScreen'>{}

// El cliente califica al conductor al recibir la carga
export function ClientTripRatingScreen({ navigation, route }: Props) {
    const { t } = useTranslation();

    const { clientRequest } = route.params;
    const rootNavigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const viewModel: ClientTripRatingViewModel = container.resolve('clientTripRatingViewModel');
    const { showToast } = useToast();
    const [sending, setSending] = useState(false);

    const handleSubmit = async (rating: number) => {
        const error = viewModel.validate(rating);
        if (error) {
            showToast(error, 'error');
            return;
        }
        setSending(true);
        const response = await viewModel.updateDriverRating(clientRequest.id, rating);
        setSending(false);
        if (typeof response === 'boolean') {
            showToast(t('clientTripRating.graciasPorCalificar'), 'success');
        } else {
            showToast(formatErrorMessage(response.message), 'error');
            // 409: ya estaba calificado, así que igual se sale
            if (response.statusCode !== 409) return;
        }
        rootNavigation.replace('ClientHomeScreen');
    }

    return (
        <TripRatingView
            request={clientRequest}
            person={clientRequest.driver}
            fareLabel={t('clientTripRating.valorAcordadoDelFlete')}
            sending={sending}
            onSubmit={handleSubmit}
            onReport={() => navigation.navigate('IncidentReportScreen', { idClientRequest: clientRequest.id })}
        />
    );
}
