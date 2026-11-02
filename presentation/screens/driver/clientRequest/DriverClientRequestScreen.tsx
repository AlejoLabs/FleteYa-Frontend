import { useEffect, useRef, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { container } from "../../../../di/container";
import { ClientRequestResponse } from "../../../../domain/models/ClientRequestResponse";
import { DriverPosition } from "../../../../domain/models/DriverPosition";
import { DriverMapStackParamList } from "../../../navigator/DriverMapStackNavigator";
import { useAuth } from "../../../hooks/useAuth";
import { StateView, useToast } from "../../../components/ui";
import { colors, spacing } from "../../../theme";
import { formatErrorMessage } from "../../../utils/Formatters";
import { DriverClientRequestViewModel } from "./DriverClientRequestViewModel";
import { DriverClientRequestItem } from "./DriverClientRequestItem";

interface Props extends StackScreenProps<DriverMapStackParamList, 'DriverClientRequestScreen'> { };

type LoadState = 'loading' | 'ready' | 'noPosition' | 'error';

// Solicitudes cerca del conductor que caben en su vehículo. Se actualiza sola con el socket y al deslizar hacia abajo
export function DriverClientRequestScreen({ navigation }: Props) {

    const viewModel: DriverClientRequestViewModel = container.resolve('driverClientRequestViewModel');
    const { authResponse } = useAuth();
    const { showToast } = useToast();
    const idDriver = authResponse?.user.id!;
    const [requests, setRequests] = useState<ClientRequestResponse[]>([]);
    const [loadState, setLoadState] = useState<LoadState>('loading');
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('No pudimos cargar las solicitudes.');
    const positionRef = useRef<DriverPosition | null>(null);

    // La última posición que guardó el inicio; si el conductor no ha estado disponible todavía no hay ninguna
    const loadPosition = async () => {
        const response = await viewModel.getDriverPosition(idDriver);
        positionRef.current = 'id_driver' in response ? response : null;
        return positionRef.current;
    }

    const reloadList = async () => {
        const position = positionRef.current ?? await loadPosition();
        if (!position) {
            setLoadState('noPosition');
            return;
        }
        const response = await viewModel.getNearbyTripRequest({ latitude: position.lat, longitude: position.lng });
        if (Array.isArray(response)) {
            setRequests(response);
            setLoadState('ready');
        } else {
            // El servidor dice por qué (por ejemplo, que la cuenta está en revisión). Si ya había una lista,
            // un fallo al recargar la deja como estaba
            setErrorMessage(formatErrorMessage(response.message));
            setLoadState((current) => current === 'ready' ? 'ready' : 'error');
        }
    }

    // Deslizar hacia abajo vuelve a leer la posición: el conductor pudo moverse desde que abrió la lista
    const refresh = async () => {
        setRefreshing(true);
        await loadPosition();
        await reloadList();
        setRefreshing(false);
    }

    useEffect(() => {
        reloadList();
        const listeners = [
            viewModel.listenerNewClientRequestSocket(() => reloadList()),
            viewModel.listenerClientRequestsChanged(() => reloadList()),
            viewModel.listenerOfferStatus(idDriver, (data) => {
                showToast(data.reason === 'OTHER_DRIVER' ? 'El cliente eligió a otro conductor' : 'El cliente rechazó tu oferta; puedes contraofertar', 'info');
                reloadList();
            }),
            // El cliente aceptó la oferta de este conductor: empieza el viaje
            viewModel.listenerNewDriverAssignedSocket(idDriver, (data: any) => {
                navigation.navigate('DriverTripMapScreen', { idClientRequest: data.id_client_request });
            }),
        ];
        return () => listeners.forEach((off) => off());
    }, []);

    if (loadState === 'loading') return <View style={styles.screen}><StateView kind="loading" message="Buscando solicitudes cerca…" /></View>;

    return (
        <View style={styles.screen}>
            <FlatList
                data={loadState === 'ready' ? requests : []}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                // El diálogo de oferta vive dentro de la lista: sin esto el primer toque en "Ofertar" solo cierra el teclado
                keyboardShouldPersistTaps="handled"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.asphalt]} />}
                renderItem={({ item }) => <DriverClientRequestItem clientRequestResponse={item} viewModel={viewModel} idDriver={idDriver} onChanged={reloadList} />}
                ListEmptyComponent={
                    loadState === 'noPosition'
                        ? <StateView kind="empty" icon="location-outline" title="Todavía no sabemos dónde estás" message="Ponte disponible en el inicio para ver las solicitudes cerca." />
                        : loadState === 'error'
                            ? <StateView kind="error" message={errorMessage} onAction={refresh} />
                            : <StateView kind="empty" icon="cube-outline" title="No hay solicitudes cerca" message="Te avisamos cuando llegue una que quepa en tu vehículo." />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.surfaceMuted,
    },
    list: {
        flexGrow: 1,
        padding: spacing.lg,
        gap: spacing.md,
    },
});
