import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, touchTarget } from "../../theme";
import { Amount, amountLabel } from "./Money";
import { formatMoney } from "../../utils/Formatters";
import { currencyRules } from "../../utils/Countries";
import { useTranslation } from 'react-i18next';

interface Props {
    value: number;
    onChange: (value: number) => void;
    // Moneda del flete: decide el paso de los botones (en pesos de a $1.000, en euros de a 1 €) y los decimales
    currency?: string | null;
    step?: number;
    min?: number;
    max?: number;
    // Tocar el precio abre la edición a mano (la pantalla decide cómo)
    onPressValue?: () => void;
}

// Precio con − y +, como al ofrecer o subir el precio del flete. Sin step, el de la moneda
export default function PriceStepper({ value, onChange, currency, step, min = 0, max = Number.MAX_SAFE_INTEGER, onPressValue }: Props) {
    const { t } = useTranslation();
    const rules = currencyRules(currency);
    const delta = step ?? rules.fare_step;
    // Sumar 0,1 + 0,2 en coma flotante da 0,30000000000000004: cada paso se redondea a los decimales de la moneda
    const move = (amount: number) => Math.round(amount * 10 ** rules.decimals) / 10 ** rules.decimals;
    const canDecrease = move(value - delta) >= min;
    const canIncrease = move(value + delta) <= max;
    const isPesos = !currency || currency === 'COP';

    return (
        <View style={styles.container} accessibilityRole="adjustable" accessibilityValue={{ text: amountLabel(value, currency) }}>
            <StepButton icon="remove" label={isPesos ? t('priceStepper.bajarPesos', { step: delta }) : t('priceStepper.bajar', { amount: formatMoney(delta, currency) })} disabled={!canDecrease} onPress={() => onChange(move(value - delta))} />
            <Pressable onPress={onPressValue} disabled={!onPressValue} style={styles.value} accessibilityLabel={t('priceStepper.escribirElPrecio')}>
                <Amount value={value} currency={currency} size="lg" reference />
            </Pressable>
            <StepButton icon="add" label={isPesos ? t('priceStepper.subirPesos', { step: delta }) : t('priceStepper.subir', { amount: formatMoney(delta, currency) })} disabled={!canIncrease} onPress={() => onChange(move(value + delta))} />
        </View>
    );
}

function StepButton({ icon, label, disabled, onPress }: { icon: 'add' | 'remove'; label: string; disabled: boolean; onPress: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={({ pressed }) => [styles.step, pressed && styles.stepPressed, disabled && styles.stepDisabled]}
        >
            <Ionicons name={icon} size={24} color={colors.asphalt} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.xs,
        borderRadius: radius.lg,
        backgroundColor: colors.surfaceMuted,
    },
    value: {
        flex: 1,
        alignItems: 'center',
    },
    step: {
        width: touchTarget + 4,
        height: touchTarget + 4,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
    },
    stepPressed: {
        backgroundColor: colors.border,
    },
    stepDisabled: {
        opacity: 0.4,
    },
});
