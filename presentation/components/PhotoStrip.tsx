import { useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AuthImage from "./AuthImage";
import { AppText, Button } from "./ui";
import { colors, radius, spacing } from "../theme";
import { useTranslation } from 'react-i18next';
import { t } from '../../i18n';

// Una foto de la tira: local (todavía no se sube) o ya guardada en el backend
export interface PhotoItem {
    key: string;
    localUri?: string;
    path?: string;
}

interface Props {
    items: PhotoItem[];
    onAdd?: () => void;
    onRemove?: (key: string) => void;
    maxItems?: number;
    addLabel?: string;
    emptyText?: string;
}

const THUMB = 84;

// Miniaturas en fila. Tocar una la abre en grande; la ✕ la quita si la pantalla lo permite
export default function PhotoStrip({ items, onAdd, onRemove, maxItems = 4, addLabel = t('photoStrip.agregarFoto'), emptyText }: Props) {
    const { t } = useTranslation();
    const [opened, setOpened] = useState<PhotoItem | null>(null);
    const canAdd = onAdd !== undefined && items.length < maxItems;

    const renderImage = (item: PhotoItem, style: object) => item.path
        ? <AuthImage path={item.path} style={style} resizeMode="cover" />
        : <Image source={{ uri: item.localUri }} style={style} resizeMode="cover" />;

    if (!items.length && !canAdd) {
        return emptyText ? <AppText variant="small" color="textMuted" style={styles.empty}>{emptyText}</AppText> : null;
    }

    return (
        <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                {items.map((item, index) => (
                    <View key={item.key}>
                        <Pressable onPress={() => setOpened(item)} accessibilityRole="imagebutton" accessibilityLabel={t('photoStrip.verLaFoto', { value: index + 1 })}>
                            {renderImage(item, styles.thumb)}
                        </Pressable>
                        {onRemove &&
                            <Pressable style={styles.remove} onPress={() => onRemove(item.key)} accessibilityRole="button" accessibilityLabel={t('photoStrip.quitarLaFoto', { value: index + 1 })} hitSlop={12}>
                                <Ionicons name="close" size={14} color={colors.textOnDark} />
                            </Pressable>
                        }
                    </View>
                ))}
                {canAdd &&
                    <Pressable
                        style={({ pressed }) => [styles.thumb, styles.add, pressed && styles.addPressed]}
                        onPress={onAdd}
                        accessibilityRole="button"
                        accessibilityLabel={addLabel}
                    >
                        <Ionicons name="add" size={26} color={colors.textMuted} />
                        <AppText variant="caption" color="textMuted" align="center">{addLabel}</AppText>
                    </Pressable>
                }
            </ScrollView>

            <Modal visible={opened !== null} transparent animationType="fade" onRequestClose={() => setOpened(null)} statusBarTranslucent>
                <View style={styles.viewer}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpened(null)} accessibilityRole="button" accessibilityLabel={t('photoStrip.cerrarLaFoto')} />
                    {opened && renderImage(opened, styles.full)}
                    <Button title={t('common.cerrar')} variant="onDark" icon="close" onPress={() => setOpened(null)} style={styles.close} />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        gap: spacing.md,
        paddingVertical: spacing.sm,
        // Deja espacio a la ✕, que sobresale de la esquina
        paddingRight: spacing.sm,
    },
    thumb: {
        width: THUMB,
        height: THUMB,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceMuted,
    },
    add: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xxs,
        paddingHorizontal: spacing.xs,
        borderWidth: 1,
        borderColor: colors.borderStrong,
        borderStyle: 'dashed',
    },
    addPressed: {
        backgroundColor: colors.border,
    },
    remove: {
        position: 'absolute',
        top: -spacing.xs - 2,
        right: -spacing.xs - 2,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.asphalt,
        borderWidth: 2,
        borderColor: colors.surface,
    },
    empty: {
        paddingVertical: spacing.xs,
    },
    viewer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.viewer,
    },
    full: {
        width: '100%',
        height: '75%',
    },
    close: {
        marginTop: spacing.xl,
        paddingHorizontal: spacing.xl,
    },
});
