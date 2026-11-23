import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppText, Button, Card, Chip, TextField } from "../../../components/ui";
import { TripPayment } from "../../../../domain/models/TripPayment";
import { formatMoney } from "../../../utils/Formatters";
import { spacing } from "../../../theme";
import { useTranslation } from 'react-i18next';
import { TripPaymentViewModel } from "./TripPaymentViewModel";

interface Props {
    viewModel: TripPaymentViewModel;
    payment: TripPayment;
    disabled: boolean;
    onChange: (tip: number) => void;
}

// Propina para el conductor: botones con porcentajes si el país los sugiere (SUGGESTED) o un campo libre (OPTIONAL).
// Va completa para el conductor y no paga comisión. La pantalla no lo dibuja si el país no recibe propina (NONE)
export default function TipSelector({ viewModel, payment, disabled, onChange }: Props) {
    const { t } = useTranslation();
    const [text, setText] = useState(payment.tip > 0 ? String(payment.tip) : '');
    const [invalid, setInvalid] = useState(false);

    // Si el monto cambia por otro lado (un botón, o el backend lo redondeó), el campo lo refleja
    useEffect(() => {
        setText(payment.tip > 0 ? String(payment.tip) : '');
        setInvalid(false);
    }, [payment.tip]);

    const applyText = () => {
        const tip = viewModel.parseTip(text, payment);
        setInvalid(tip === null);
        if (tip !== null) onChange(tip);
    }

    return (
        <Card variant="outlined">
            <AppText variant="label" color="textMuted">{t('tripPayment.propinaParaElConductor')}</AppText>
            <AppText variant="small" color="textMuted">{t('tripPayment.vaCompletaParaElConductor')}</AppText>

            {payment.tip_mode === 'SUGGESTED' &&
                <View style={styles.chips}>
                    <Chip label={t('tripPayment.sinPropina')} selected={payment.tip === 0} disabled={disabled} onPress={() => onChange(0)} />
                    {viewModel.tipOptions(payment).map((option) =>
                        <Chip
                            key={option.percent}
                            label={t('tripPayment.porcentajeConMonto', { percent: option.percent, amount: formatMoney(option.amount, payment.currency) })}
                            selected={option.selected}
                            disabled={disabled}
                            onPress={() => onChange(option.amount)}
                        />)}
                </View>
            }

            {payment.tip_mode === 'OPTIONAL' &&
                <View style={styles.custom}>
                    <View style={styles.field}>
                        <TextField
                            label={t('tripPayment.montoDeLaPropina')}
                            value={text}
                            onChangeText={(value) => { setText(value); setInvalid(false); }}
                            keyboardType="decimal-pad"
                            placeholder={formatMoney(0, payment.currency)}
                            hint={t('tripPayment.propinaMaxima', { max: formatMoney(payment.max_tip, payment.currency) })}
                            error={invalid ? t('tripPayment.escribeUnMontoValido') : null}
                            editable={!disabled}
                            onSubmitEditing={applyText}
                            returnKeyType="done"
                        />
                    </View>
                    <Button title={t('tripPayment.aplicar')} variant="secondary" style={styles.apply} disabled={disabled} onPress={applyText} />
                </View>
            }
        </Card>
    );
}

const styles = StyleSheet.create({
    chips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    custom: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
    },
    field: {
        flex: 1,
    },
    apply: {
        paddingHorizontal: spacing.lg,
        marginTop: spacing.lg + spacing.xs,
    },
});
