import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, FlatList, Keyboard, Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { PlacePrediction } from "../../../../../domain/models/PlacePrediction";
import { AppHeader, AppText, TextField } from "../../../../components/ui";
import { colors, spacing, touchTarget } from "../../../../theme";
import { ClientSearchMapViewModel } from "../ClientSearchMapViewModel";
import { useTranslation } from 'react-i18next';

interface Props {
    viewModel: ClientSearchMapViewModel;
    title: string;
    placeholder: string;
    onClose: () => void;
    // place_id de Google; la pantalla pide los detalles y las coordenadas
    onSelect: (placeId: string) => void;
}

// Se busca cuando el cliente deja de escribir un momento, no con cada letra
const SEARCH_DELAY_MS = 350;
const MIN_LENGTH = 3;

// Buscador de direcciones a pantalla completa, para el origen o el destino.
// Es una capa y no un Modal: un Modal abre otra ventana y taparía los avisos de la app
export default function PlaceSearchOverlay({ viewModel, title, placeholder, onClose, onSelect }: Props) {
    const { t } = useTranslation();
    // El teclado se cierra antes de quitar la capa: si el campo desaparece con el teclado abierto,
    // Android no avisa que se cerró y la hoja de abajo se queda subida
    const close = () => { Keyboard.dismiss(); onClose(); };
    const select = (placeId: string) => { Keyboard.dismiss(); onSelect(placeId); };
    const inputRef = useRef<TextInput>(null);
    const [text, setText] = useState('');
    const [results, setResults] = useState<PlacePrediction[]>([]);
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);
    const requestId = useRef(0);

    useEffect(() => {
        const timer = setTimeout(() => inputRef.current?.focus(), 250);
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            close();
            return true;
        });
        return () => {
            clearTimeout(timer);
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        if (text.trim().length < MIN_LENGTH) {
            setResults([]);
            setLoading(false);
            return;
        }
        const id = ++requestId.current;
        setLoading(true);
        const timer = setTimeout(async () => {
            const predictions = await viewModel.searchPlaces(text);
            // Una respuesta vieja que llegue tarde no pisa la de lo último que se escribió
            if (id !== requestId.current) return;
            setLoading(false);
            setFailed(predictions === null);
            setResults(predictions ?? []);
        }, SEARCH_DELAY_MS);
        return () => clearTimeout(timer);
    }, [text]);

    const searched = text.trim().length >= MIN_LENGTH && !loading;

    return (
        <SafeAreaView style={styles.screen}>
            <AppHeader title={title} onBack={close} />
            <View style={styles.search}>
                <TextField
                    ref={inputRef}
                    icon="search"
                    placeholder={placeholder}
                    value={text}
                    onChangeText={setText}
                    autoCorrect={false}
                    returnKeyType="search"
                />
            </View>
            <FlatList
                data={results}
                keyExtractor={(item) => item.place_id}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.list}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => select(item.place_id)}
                        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                        accessibilityRole="button"
                    >
                        <Ionicons name="location-outline" size={22} color={colors.textMuted} />
                        <View style={styles.texts}>
                            <AppText variant="bodyStrong" numberOfLines={1}>{item.structured_formatting?.main_text ?? item.description}</AppText>
                            {item.structured_formatting?.secondary_text &&
                                <AppText variant="small" color="textMuted" numberOfLines={1}>{item.structured_formatting.secondary_text}</AppText>}
                        </View>
                    </Pressable>
                )}
                ListHeaderComponent={loading ? <ActivityIndicator color={colors.asphalt} style={styles.loader} /> : null}
                ListEmptyComponent={loading ? null :
                    <AppText variant="small" color="textMuted" style={styles.empty}>
                        {!searched
                            ? t('placeSearchOverlay.escribeLaDireccionOEl')
                            : failed
                                ? t('placeSearchOverlay.noPudimosBuscarDireccionesRevisa')
                                : t('placeSearchOverlay.noEncontramosEseLugarPrueba')}
                    </AppText>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.background,
    },
    search: {
        padding: spacing.lg,
        paddingBottom: spacing.sm,
    },
    list: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: touchTarget + 8,
        paddingVertical: spacing.sm,
    },
    rowPressed: {
        backgroundColor: colors.surfaceMuted,
    },
    texts: {
        flex: 1,
        gap: spacing.xxs,
    },
    separator: {
        height: 1,
        backgroundColor: colors.border,
    },
    loader: {
        paddingVertical: spacing.md,
    },
    empty: {
        paddingVertical: spacing.md,
    },
});
