import { useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AuthImage from "./AuthImage";

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

// Miniaturas en fila. Tocar una la abre en grande; la ✕ la quita si la pantalla lo permite
export default function PhotoStrip({ items, onAdd, onRemove, maxItems = 4, addLabel = 'Agregar foto', emptyText }: Props) {
    const [opened, setOpened] = useState<PhotoItem | null>(null);
    const canAdd = onAdd !== undefined && items.length < maxItems;

    const renderImage = (item: PhotoItem, style: object) => item.path
        ? <AuthImage path={item.path} style={style} resizeMode="cover" />
        : <Image source={{ uri: item.localUri }} style={style} resizeMode="cover" />;

    if (!items.length && !canAdd) {
        return emptyText ? <Text style={styles.empty}>{emptyText}</Text> : null;
    }

    return (
        <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                {items.map((item) => (
                    <View key={item.key}>
                        <TouchableOpacity onPress={() => setOpened(item)} accessibilityLabel="Ver foto">
                            {renderImage(item, styles.thumb)}
                        </TouchableOpacity>
                        {onRemove &&
                            <TouchableOpacity style={styles.remove} onPress={() => onRemove(item.key)} accessibilityLabel="Quitar foto" hitSlop={8}>
                                <Text style={styles.removeText}>✕</Text>
                            </TouchableOpacity>
                        }
                    </View>
                ))}
                {canAdd &&
                    <TouchableOpacity style={[styles.thumb, styles.add]} onPress={onAdd}>
                        <Text style={styles.addPlus}>+</Text>
                        <Text style={styles.addText}>{addLabel}</Text>
                    </TouchableOpacity>
                }
            </ScrollView>

            <Modal visible={opened !== null} transparent animationType="fade" onRequestClose={() => setOpened(null)}>
                <View style={styles.viewer}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpened(null)} />
                    {opened && renderImage(opened, styles.full)}
                    <TouchableOpacity style={styles.close} onPress={() => setOpened(null)}>
                        <Text style={styles.closeText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        gap: 10,
        paddingVertical: 6,
    },
    thumb: {
        width: 84,
        height: 84,
        borderRadius: 12,
        backgroundColor: '#eee',
    },
    add: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#bbb',
        borderStyle: 'dashed',
        backgroundColor: '#fafafa',
    },
    addPlus: {
        fontSize: 26,
        color: '#555',
    },
    addText: {
        fontSize: 11,
        color: '#555',
        textAlign: 'center',
        paddingHorizontal: 4,
    },
    remove: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    empty: {
        color: '#777',
        paddingVertical: 6,
    },
    viewer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.92)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    full: {
        width: '100%',
        height: '75%',
    },
    close: {
        marginTop: 20,
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 24,
        backgroundColor: 'white',
    },
    closeText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
});
