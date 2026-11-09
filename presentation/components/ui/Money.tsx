import { StyleSheet, View } from "react-native";
import { colors, spacing } from "../../theme";
import { formatCOP } from "../../utils/Formatters";
import AppText from "./AppText";
import Card from "./Card";
import { useTranslation } from 'react-i18next';
import { t } from '../../../i18n';

interface AmountProps {
    value: number;
    size?: 'md' | 'lg';
    color?: 'text' | 'cargo' | 'textOnDark' | 'success';
}

// Un precio en pesos con la tipografía de placa: ofertas, valor acordado, ganancias
export function Amount({ value, size = 'md', color = 'text' }: AmountProps) {
    return (
        <AppText variant={size === 'lg' ? 'priceLarge' : 'price'} color={color}accessibilityLabel={t('common.pesos', { value })}>
            {formatCOP(value)}
        </AppText>
    );
}

interface AmountRowProps {
    label: string;
    value: number;
    // fee: comisión de FleteYa, ya incluida en el total (se muestra, no se suma); discount: se resta
    kind?: 'charge' | 'fee' | 'discount';
}

export function AmountRow({ label, value, kind = 'charge' }: AmountRowProps) {
    const sign = kind === 'discount' ? '−' : '';
    return (
        <View style={styles.row}>
            <AppText variant="small" color={kind === 'charge' ? 'text' : 'textMuted'} style={styles.label}>{label}</AppText>
            <AppText variant="smallStrong" color={kind === 'discount' ? 'success' : 'text'}>{sign}{formatCOP(value)}</AppText>
        </View>
    );
}

export interface ReceiptLine {
    label: string;
    value: number;
    kind?: 'charge' | 'fee' | 'discount';
}

interface ReceiptProps {
    title?: string;
    lines: ReceiptLine[];
    totalLabel?: string;
    total: number;
    footnote?: string;
}

// Recibo del viaje (Fase 7): detalle, total y una nota como "Pagado en efectivo"
export function ReceiptCard({ title = t('money.resumenDelPago'), lines, totalLabel = t('money.total'), total, footnote }: ReceiptProps) {
    const { t } = useTranslation();
    return (
        <Card variant="outlined">
            <AppText variant="label" color="textMuted">{title}</AppText>
            <View style={styles.lines}>
                {lines.map((line) => <AmountRow key={line.label} {...line} />)}
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
                <AppText variant="bodyStrong" style={styles.label}>{totalLabel}</AppText>
                <Amount value={total} />
            </View>
            {footnote && <AppText variant="caption" color="textMuted">{footnote}</AppText>}
        </Card>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    label: {
        flex: 1,
    },
    lines: {
        gap: spacing.sm,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
    },
});
