import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { DriverTripOffer } from "../../../../domain/models/DriverTripOffer";
import { ClientMapStackParamList } from "../../../navigator/ClientMapStackNavigator";
import { Amount, Button, Card, PersonRow, useToast } from "../../../components/ui";
import { spacing } from "../../../theme";
import { formatCOP, formatErrorMessage } from "../../../utils/Formatters";
import { vehicleLabel } from "../../../utils/Cargo";
import { ClientSearchMapViewModel } from "./ClientSearchMapViewModel";

interface Props {
    viewModel: ClientSearchMapViewModel;
    driverTripOffer: DriverTripOffer;
    navigation: StackNavigationProp<ClientMapStackParamList, 'ClientSearchMapScreen', undefined>;
    // Se llama después de aceptar o rechazar, para que el panel actualice la lista
    onResolved: (accepted: boolean) => void;
}

// Oferta de un conductor, para comparar: calificación real, vehículo, cuánto tarda en llegar y su precio
export function DriverOfferItem({ viewModel, driverTripOffer, navigation, onResolved }: Props) {

    const { showToast } = useToast();
    const [busy, setBusy] = useState<'accept' | 'reject' | null>(null);
    const { driver, car, fare_offered } = driverTripOffer;
    const name = `${driver?.name ?? ''} ${driver?.lastname?.charAt(0) ?? ''}.`.trim();
    const vehicle = [vehicleLabel(car?.vehicle_type), car?.brand].filter(Boolean).join(' ');

    const handleAccept = async () => {
        if (busy) return;
        setBusy('accept');
        const response = await viewModel.updateDriverAssigned(driverTripOffer.id_client_request, driverTripOffer.id_driver, fare_offered);
        setBusy(null);
        if (response === true || (response as any)?.id_driver_assigned === driverTripOffer.id_driver) {
            viewModel.emitNewDriverAssigned(driverTripOffer.id_client_request, driverTripOffer.id_driver);
            onResolved(true);
            navigation.navigate('ClientTripMapScreen', {
                idClientRequest: driverTripOffer.id_client_request,
                idDriver: driverTripOffer.id_driver,
            });
        } else {
            showToast(formatErrorMessage((response as any).message), 'error');
            onResolved(false);
        }
    }

    const handleReject = async () => {
        if (busy) return;
        setBusy('reject');
        const response = await viewModel.rejectDriverTripOffer(driverTripOffer.id!);
        setBusy(null);
        if (response !== true) showToast(formatErrorMessage((response as any).message), 'error');
        onResolved(false);
    }

    return (
        <Card variant="elevated" style={styles.card}>
            <PersonRow
                name={name}
                imageUri={driver?.image}
                rating={driver?.rating ?? null}
                subtitle={`${vehicle} · llega en ${Math.max(1, Math.round(driverTripOffer.time))} min`}
                right={<Amount value={fare_offered} />}
            />
            <View style={styles.actions}>
                <Button title="Rechazar" variant="danger" size="sm" loading={busy === 'reject'} disabled={busy === 'accept'} onPress={handleReject} style={styles.reject} />
                <Button title={`Aceptar ${formatCOP(fare_offered)}`} variant="success" size="sm" loading={busy === 'accept'} disabled={busy === 'reject'} onPress={handleAccept} style={styles.accept} />
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        gap: spacing.md,
    },
    actions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    reject: {
        flex: 1,
    },
    accept: {
        flex: 2,
    },
});
