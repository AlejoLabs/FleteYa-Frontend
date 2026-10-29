import { StyleSheet, View } from "react-native";
import { DriverDocument } from "../../domain/models/DriverDocument";
import { AppText, StatusPill, StatusTone } from "./ui";
import { colors, spacing } from "../theme";

const TONES: Record<DriverDocument['status'], StatusTone> = {
    OK: 'success',
    EXPIRING: 'warning',
    EXPIRED: 'danger',
};

// "Vigente", "En 12 días" o "Vencido"
export const documentStatusLabel = (doc: DriverDocument) => {
    if (doc.status === 'EXPIRED') return 'Vencido';
    if (doc.status === 'EXPIRING') return doc.days_left === 0 ? 'Vence hoy' : `En ${doc.days_left} ${doc.days_left === 1 ? 'día' : 'días'}`;
    return 'Vigente';
}

const formatExpiry = (doc: DriverDocument) => {
    const date = new Date(doc.expires_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
    return doc.status === 'EXPIRED' ? `Venció el ${date}` : `Vence el ${date}`;
}

// Documentos del conductor con su vencimiento y su estado, uno por fila
export default function DocumentsStatus({ documents }: { documents: DriverDocument[] }) {
    return (
        <View>
            {documents.map((doc, index) => (
                <View key={doc.key} style={[styles.row, index > 0 && styles.divider]}>
                    <View style={styles.texts}>
                        <AppText variant="bodyStrong">{doc.label}</AppText>
                        <AppText variant="small" color="textMuted">{formatExpiry(doc)}</AppText>
                    </View>
                    <StatusPill label={documentStatusLabel(doc)} tone={TONES[doc.status]} />
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
    },
    divider: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    texts: {
        flex: 1,
        gap: spacing.xxs,
    },
});
