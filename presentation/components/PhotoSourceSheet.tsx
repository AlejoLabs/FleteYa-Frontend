import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing } from "../theme";
import { AppText, Button, ListItem } from "./ui";
import { PhotoSource, setPhotoSourcePresenter } from "../utils/PhotoPicker";

// Hoja de abajo para elegir entre cámara y galería, con el estilo de la app en vez del Alert del sistema.
// Se monta una vez en App: choosePhoto (PhotoPicker) la abre desde cualquier pantalla y espera la respuesta
export default function PhotoSourceSheet() {
    const insets = useSafeAreaInsets();
    const [title, setTitle] = useState<string | null>(null);
    const resolver = useRef<((source: PhotoSource | null) => void) | null>(null);

    useEffect(() => {
        setPhotoSourcePresenter((nextTitle) => new Promise((resolve) => {
            // Si ya había una abierta, la anterior queda como cancelada
            resolver.current?.(null);
            resolver.current = resolve;
            setTitle(nextTitle);
        }));
        return () => setPhotoSourcePresenter(null);
    }, []);

    const close = (source: PhotoSource | null) => {
        resolver.current?.(source);
        resolver.current = null;
        setTitle(null);
    };

    return (
        <Modal visible={title !== null} transparent animationType="slide" onRequestClose={() => close(null)} statusBarTranslucent>
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={() => close(null)} accessibilityRole="button" accessibilityLabel="Cerrar" />
                <View style={[styles.sheet, { paddingBottom: spacing.lg + insets.bottom }]} accessibilityViewIsModal>
                    <View style={styles.handle} />
                    <AppText variant="title">{title}</AppText>
                    <AppText variant="body" color="textMuted">¿De dónde quieres sacar la foto?</AppText>
                    <View style={styles.options}>
                        <ListItem icon="camera-outline" title="Tomar foto" subtitle="Abre la cámara" onPress={() => close('camera')} />
                        <ListItem icon="images-outline" title="Elegir de la galería" subtitle="Una foto que ya tienes" onPress={() => close('library')} />
                    </View>
                    <Button title="Cancelar" variant="text" onPress={() => close(null)} />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: colors.overlay,
    },
    sheet: {
        gap: spacing.sm,
        paddingTop: spacing.sm,
        paddingHorizontal: spacing.xl,
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        backgroundColor: colors.surface,
    },
    handle: {
        alignSelf: 'center',
        width: 40,
        height: 4,
        marginBottom: spacing.sm,
        borderRadius: radius.pill,
        backgroundColor: colors.borderStrong,
    },
    options: {
        marginTop: spacing.xs,
    },
});
