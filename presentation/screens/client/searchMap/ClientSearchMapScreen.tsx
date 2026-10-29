import { useEffect, useRef, useState } from "react";
import { BackHandler, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import { container } from "../../../../di/container";
import { ClientMapStackParamList } from "../../../navigator/ClientMapStackNavigator";
import { useAuth } from "../../../hooks/useAuth";
import { KeyboardArea, Sheet, useToast } from "../../../components/ui";
import { colors, shadows, spacing, touchTarget } from "../../../theme";
import { formatErrorMessage } from "../../../utils/Formatters";
import { ClientSearchMapViewModel } from "./ClientSearchMapViewModel";
import { useClientMap } from "./hooks/useClientMap";
import { useRequestDraft } from "./hooks/useRequestDraft";
import RequestMap from "./components/RequestMap";
import PlaceSearchOverlay from "./components/PlaceSearchOverlay";
import SearchingPanel from "./SearchingPanel";
import RouteStep from "./steps/RouteStep";
import CargoStep from "./steps/CargoStep";
import SizeStep from "./steps/SizeStep";
import PriceStep from "./steps/PriceStep";
import { StepActions } from "./components/StepParts";

interface Props extends StackScreenProps<ClientMapStackParamList, 'ClientSearchMapScreen'> { };

type SearchTarget = 'origin' | 'destination' | null;

// Alto máximo de la hoja en los pasos largos: deja arriba un tercio de mapa para ver la ruta; el formulario se desplaza
const SHEET_MAX = 0.62;

// Pedir un flete: mapa a pantalla completa y la solicitud en una hoja inferior de cuatro pasos
export default function ClientSearchMapScreen({ navigation, route }: Props) {

    const viewModel: ClientSearchMapViewModel = container.resolve("clientSearchMapViewModel");
    const { authResponse } = useAuth();
    const { showToast } = useToast();
    const insets = useSafeAreaInsets();
    const { height: windowHeight } = useWindowDimensions();
    const map = useClientMap(viewModel);
    const request = useRequestDraft(viewModel);
    const { draft, step } = request;

    const [sheetHeight, setSheetHeight] = useState(0);
    const [searchTarget, setSearchTarget] = useState<SearchTarget>(null);
    const [publishing, setPublishing] = useState(false);
    // Búsqueda en curso: mientras exista se muestra el panel de ofertas
    const [activeSearchId, setActiveSearchId] = useState<number | null>(route.params?.idClientRequest ?? null);
    // El origen solo sale del centro del mapa cuando el cliente lo arrastra (o al centrarse la primera vez).
    // Los movimientos por código (buscar una dirección, encuadrar la ruta, cambiar el alto de la hoja) no lo tocan
    const userDragged = useRef(false);

    useEffect(() => {
        if (route.params?.idClientRequest) setActiveSearchId(route.params.idClientRequest);
    }, [route.params?.idClientRequest]);

    // Cuando llega la ubicación del teléfono el mapa se centra ahí: ese primer movimiento sí pone el origen,
    // que hasta entonces estaba en el punto por defecto del mapa
    const hadLocation = useRef(false);
    useEffect(() => {
        if (!map.userLocation || hadLocation.current) return;
        hadLocation.current = true;
        if (step === 0) userDragged.current = true;
    }, [map.userLocation]);

    // Fuera del paso de la ruta, el mapa muestra el recorrido completo encima de la hoja. Se espera a que la hoja
    // del paso nuevo tenga su alto y el mapa su margen; no se reajusta cuando la hoja solo crece por un error
    // Al volver al paso de la ruta, el pin vuelve a quedar sobre el origen elegido
    useEffect(() => {
        const timer = setTimeout(() => {
            if (step > 0) map.fitRoute(request.route);
            else if (draft.origin) map.moveCamera(draft.origin.lat, draft.origin.lng);
        }, 700);
        return () => clearTimeout(timer);
    }, [step, request.route]);

    // Atrás del teléfono retrocede un paso antes de salir de la pantalla
    useEffect(() => {
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            if (step === 0 || activeSearchId !== null) return false;
            request.back();
            return true;
        });
        return () => subscription.remove();
    }, [step, activeSearchId]);

    const handleMapMoveEnd = async () => {
        if (step !== 0 || !userDragged.current) return;
        userDragged.current = false;
        const center = await map.getCenter();
        if (center) request.setOriginFromMap(center.latitude, center.longitude);
    }

    const handleSelectPlace = async (placeId: string) => {
        const target = searchTarget;
        setSearchTarget(null);
        const place = await request.placeFromId(placeId);
        if (!place) {
            showToast('No pudimos ubicar esa dirección. Prueba con otra', 'error');
            return;
        }
        if (target === 'origin') {
            map.moveCamera(place.lat, place.lng);
            request.update({ origin: place });
        } else {
            request.update({ destination: place });
        }
    }

    const handlePublish = async () => {
        if (!request.validate() || !authResponse) return;
        setPublishing(true);
        const response = await viewModel.publish(draft, authResponse.user.id!);
        setPublishing(false);
        if ('statusCode' in response) {
            showToast(formatErrorMessage(response.message), 'error');
            return;
        }
        if (response.failedPhotos) showToast(`El flete se publicó, pero no se pudieron subir ${response.failedPhotos} fotos`, 'error');
        setActiveSearchId(response.id);
        request.reset();
    }

    return (
        <View style={styles.screen}>
            <RequestMap
                mapRef={map.mapRef}
                bottomInset={sheetHeight}
                pickingOrigin={step === 0}
                origin={draft.origin}
                destination={draft.destination}
                route={request.route}
                drivers={map.driverMarkers}
                onMoveStart={() => { userDragged.current = true; }}
                onMoveEnd={handleMapMoveEnd}
            />

            <View style={[styles.topBar, { top: insets.top + spacing.sm }]} pointerEvents="box-none">
                <FloatingButton icon="menu" label="Abrir menú" onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
            </View>

            <KeyboardArea style={styles.sheetArea} pointerEvents="box-none">
                {step === 0 && map.userLocation &&
                    <View style={styles.locateRow} pointerEvents="box-none">
                        <FloatingButton icon="locate" label="Ir a mi ubicación" onPress={() => { userDragged.current = true; map.centerOnUser(); }} />
                    </View>
                }
                <View onLayout={(event) => setSheetHeight(event.nativeEvent.layout.height)}>
                    {/* key: al cambiar de paso la hoja vuelve arriba */}
                    <Sheet
                        key={step}
                        scroll={step > 0}
                        maxHeight={step > 0 ? windowHeight * SHEET_MAX : undefined}
                        footer={
                            <StepActions
                                onBack={step > 0 ? request.back : undefined}
                                onNext={step === 3 ? handlePublish : request.next}
                                nextLabel={step < 3 ? 'Continuar' : draft.scheduledAt ? 'Programar flete' : 'Publicar flete'}
                                loading={publishing}
                            />
                        }
                    >
                        {step === 0 &&
                            <RouteStep state={request} locationUnavailable={map.permissionDenied} onSearchOrigin={() => setSearchTarget('origin')} onSearchDestination={() => setSearchTarget('destination')} />}
                        {step === 1 && <CargoStep state={request} />}
                        {step === 2 && <SizeStep state={request} />}
                        {step === 3 && <PriceStep state={request} />}
                    </Sheet>
                </View>
            </KeyboardArea>

            {searchTarget !== null &&
                <PlaceSearchOverlay
                viewModel={viewModel}
                title={searchTarget === 'origin' ? '¿Dónde recogemos la carga?' : '¿A dónde la llevamos?'}
                placeholder={searchTarget === 'origin' ? 'Dirección de recogida' : 'Dirección de entrega'}
                onClose={() => setSearchTarget(null)}
                onSelect={handleSelectPlace}
                />
            }

            {activeSearchId !== null &&
                <SearchingPanel
                    key={activeSearchId}
                    viewModel={viewModel}
                    idClientRequest={activeSearchId}
                    navigation={navigation}
                    onClose={() => {
                        setActiveSearchId(null);
                        navigation.setParams({ idClientRequest: undefined });
                        // Con el panel cerrado el mapa vuelve a verse: el flete nuevo arranca desde la ubicación del teléfono
                        if (!draft.origin && map.userLocation) {
                            userDragged.current = true;
                            setTimeout(map.centerOnUser, 300);
                        }
                    }}
                />
            }
        </View>
    );
}

function FloatingButton({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={({ pressed }) => [styles.floating, pressed && styles.floatingPressed]}
        >
            <Ionicons name={icon} size={24} color={colors.asphalt} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.surfaceMuted,
    },
    topBar: {
        position: 'absolute',
        left: spacing.lg,
    },
    sheetArea: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
    locateRow: {
        alignItems: 'flex-end',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
    },
    floating: {
        width: touchTarget,
        height: touchTarget,
        borderRadius: touchTarget / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        ...shadows.card,
    },
    floatingPressed: {
        backgroundColor: colors.surfaceMuted,
    },
});
