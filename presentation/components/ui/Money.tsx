import { StyleSheet, View } from "react-native";
import { colors, spacing } from "../../theme";
import { formatMoney } from "../../utils/Formatters";
import AppText from "./AppText";
import Card from "./Card";
import { useTranslation } from 'react-i18next';
import { t } from '../../../i18n';
import { referenceAmount } from "../../utils/Countries";
import { useCountriesVersion } from "../../hooks/useCountries";

interface AmountProps {
    value: number;
    // Moneda del flete (COP, EUR...); sin ella, pesos colombianos
    currency?: string | null;
    size?: 'md' | 'lg';
    color?: 'text' | 'cargo' | 'textOnDark' | 'success';
    // Debajo, el monto aproximado en la moneda de la persona si el flete es en otra ("≈ US$ 27")
    reference?: boolean;
}

// Lo que lee el lector de pantalla: en pesos, "25000 pesos" como siempre; en otra moneda, el monto con su moneda
export const amountLabel = (value: number, currency?: string | null) =>
    !currency || currency === 'COP' ? t('common.pesos', { value }) : formatMoney(value, currency);

// Un precio en la moneda del flete con la tipografía de placa: ofertas, valor acordado, ganancias
export function Amount({ value, currency, size = 'md', color = 'text', reference = false }: AmountProps) {
    const amount = (
        <AppText variant={size === 'lg' ? 'priceLarge' : 'price'} color={color}accessibilityLabel={amountLabel(value, currency)}>
            {formatMoney(value, currency)}
        </AppText>
    );
    if (!reference) return amount;
    return (
        <View>
            {amount}
            <ReferenceAmount value={value} currency={currency} onDark={color === 'textOnDark' || color === 'cargo'} />
        </View>
    );
}

// "≈ US$ 27": tipo de cambio de referencia del backend (Banco Central Europeo y TRM). Si falta la tasa, no aparece
export function ReferenceAmount({ value, currency, onDark = false }: { value: number; currency?: string | null; onDark?: boolean }) {
    useCountriesVersion();
    const reference = referenceAmount(value, currency);
    if (!reference) return null;
    const text = formatMoney(reference.amount, reference.currency);
    return (
        <AppText variant="caption" color={onDark ? 'textOnDarkMuted' : 'textMuted'} accessibilityLabel={t('money.aproximadamente', { amount: text })}>
            {t('money.aproximado', { amount: text })}
        </AppText>
    );
}

interface AmountRowProps {
    label: string;
    value: number;
    currency?: string | null;
    // fee: comisión de FleteYa, ya incluida en el total (se muestra, no se suma); discount: se resta
    kind?: 'charge' | 'fee' | 'discount';
}

export function AmountRow({ label, value, currency, kind = 'charge' }: AmountRowProps) {
    const sign = kind === 'discount' ? '−' : '';
    return (
        <View style={styles.row}>
            <AppText variant="small" color={kind === 'charge' ? 'text' : 'textMuted'} style={styles.label}>{label}</AppText>
            <AppText variant="smallStrong" color={kind === 'discount' ? 'success' : 'text'}>{sign}{formatMoney(value, currency)}</AppText>
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
    // Moneda de todas las líneas (la del flete)
    currency?: string | null;
    footnote?: string;
}

// Recibo del viaje (Fase 7): detalle, total y una nota como "Pagado en efectivo"
export function ReceiptCard({ title = t('money.resumenDelPago'), lines, totalLabel = t('money.total'), total, currency, footnote }: ReceiptProps) {
    const { t } = useTranslation();
    return (
        <Card variant="outlined">
            <AppText variant="label" color="textMuted">{title}</AppText>
            <View style={styles.lines}>
                {lines.map((line) => <AmountRow key={line.label} currency={currency} {...line} />)}
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
                <AppText variant="bodyStrong" style={styles.label}>{totalLabel}</AppText>
                <Amount value={total} currency={currency} reference />
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
