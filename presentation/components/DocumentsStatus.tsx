import { StyleSheet, Text, View } from "react-native";
import { DriverDocument } from "../../domain/models/DriverDocument";

const COLORS: Record<DriverDocument['status'], { background: string; text: string }> = {
    OK: { background: '#e8f5e9', text: '#1b5e20' },
    EXPIRING: { background: '#fff4e0', text: '#7a4b00' },
    EXPIRED: { background: '#fdecea', text: '#b71c1c' },
};

export const describeDocument = (doc: DriverDocument) => {
    if (doc.status === 'EXPIRED') return `${doc.label}: vencido`;
    if (doc.status === 'EXPIRING') return `${doc.label}: vence en ${doc.days_left} ${doc.days_left === 1 ? 'día' : 'días'}`;
    return `${doc.label}: vigente`;
}

// Lista de documentos del conductor con su estado. compact = solo los que necesitan atención (aviso en el inicio)
export default function DocumentsStatus({ documents, compact = false }: { documents: DriverDocument[]; compact?: boolean }) {
    const shown = compact ? documents.filter((doc) => doc.status !== 'OK') : documents;
    if (!shown.length) return null;
    return (
        <View style={styles.list}>
            {shown.map((doc) => (
                <View key={doc.key} style={[styles.row, { backgroundColor: COLORS[doc.status].background }]}>
                    <Text style={[styles.text, { color: COLORS[doc.status].text }]}>{describeDocument(doc)}</Text>
                    {!compact && <Text style={styles.date}>{new Date(doc.expires_at).toLocaleDateString('es-CO')}</Text>}
                </View>
            ))}
            {compact && <Text style={styles.hint}>Renuévalos para seguir recibiendo fletes.</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    list: {
        gap: 6,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
    },
    text: {
        fontWeight: 'bold',
        flexShrink: 1,
    },
    date: {
        color: '#555',
        marginLeft: 8,
    },
    hint: {
        color: '#555',
        fontSize: 12,
    },
});
