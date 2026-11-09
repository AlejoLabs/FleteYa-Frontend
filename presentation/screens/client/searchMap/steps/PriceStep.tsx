import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppText, CheckboxRow, Chip, ConfirmDialog, OptionCard, PriceStepper, SwitchRow, TextField } from "../../../../components/ui";
import { spacing } from "../../../../theme";
import { cargoCategoryLabel, vehicleLabel } from "../../../../utils/Cargo";
import { formatCOP, formatKm } from "../../../../utils/Formatters";
import { RequestDraftState } from "../hooks/useRequestDraft";
import { FARE_STEP, RequestDraft } from "../RequestDraft";
import SchedulePicker from "../components/SchedulePicker";
import { SectionLabel, StepHeader, SummaryRow } from "../components/StepParts";
import { useTranslation } from 'react-i18next';

interface Props {
    state: RequestDraftState;
}

// Paso 4: cuándo, cuánto ofrece el cliente, quién entrega y recibe, y la confirmación de que la carga se puede llevar
export default function PriceStep({ state }: Props) {
    const { t } = useTranslation();
    const { draft, update, errors, step, goTo, recommendedFare, suggestedVehicle, pricing } = state;
    const suggestedValues = { amount: formatCOP(recommendedFare), distance: pricing ? t('priceStep.porDistancia', { km: formatKm(pricing.distance.value) }) : '' };
    const [isTyping, setIsTyping] = useState(false);
    const [typedFare, setTypedFare] = useState('');

    const cargoText = [
        cargoCategoryLabel(draft.category),
        t('common.articulos', { count: draft.packages }),
        vehicleLabel(draft.vehicleType ?? suggestedVehicle),
    ].join(' · ');

    const confirmTypedFare = () => {
        const value = Math.round(Number(typedFare.replace(/\D/g, '')) / 100) * 100;
        if (value > 0) update({ fare: value });
        setIsTyping(false);
    }

    return (
        <>
            <StepHeader title={t('priceStep.cuandoYPorCuanto')} step={step} />
            <SummaryRow icon="cube-outline" text={cargoText} onPress={() => goTo(1)} />

            <SectionLabel>{t('priceStep.cuando')}</SectionLabel>
            <SchedulePicker value={draft.scheduledAt} onChange={(scheduledAt) => update({ scheduledAt })} />

            <SectionLabel>{t('priceStep.tuPrecio')}</SectionLabel>
            <View style={styles.price}>
                <PriceStepper
                    value={draft.fare}
                    step={FARE_STEP}
                    min={FARE_STEP}
                    onChange={(fare) => update({ fare })}
                    onPressValue={() => { setTypedFare(draft.fare ? String(draft.fare) : ''); setIsTyping(true); }}
                />
                {errors.fare && <AppText variant="caption" color="danger">{errors.fare}</AppText>}
                {recommendedFare > 0
                    ? <View style={styles.recommended}>
                        <AppText variant="small" color="textMuted" style={styles.flex}>
                            {draft.needsHelp ? t('priceStep.sugeridoConAyuda', suggestedValues) : t('priceStep.sugeridoSoloTransporte', suggestedValues)} {t('priceStep.tocaElPrecio')}
                        </AppText>
                        {draft.fare !== recommendedFare && <Chip label={t('priceStep.usarSugerido')} onPress={() => update({ fare: recommendedFare })} />}
                    </View>
                    : <AppText variant="small" color="textMuted">{t('priceStep.calculandoElPrecioSugerido')}</AppText>
                }
            </View>

            <SectionLabel>{t('priceStep.comoPagas')}</SectionLabel>
            <View style={styles.payment}>
                <OptionCard
                    title={t('priceStep.efectivo')}
                    description={t('priceStep.lePagasAlConductorCuando')}
                    icon="cash-outline"
                    selected={draft.paymentMethod === 'CASH'}
                    onPress={() => update({ paymentMethod: 'CASH' })}
                />
                <OptionCard
                    title={t('priceStep.porLaApp')}
                    description={t('priceStep.nequiTarjetaOPseCuando')}
                    icon="phone-portrait-outline"
                    selected={draft.paymentMethod === 'WOMPI'}
                    onPress={() => update({ paymentMethod: 'WOMPI' })}
                />
            </View>

            <SectionLabel>{t('priceStep.contactos')}</SectionLabel>
            <SwitchRow label={t('priceStep.otraPersonaEntregaLaCarga')} value={draft.otherSender} onChange={(otherSender) => update({ otherSender })} />
            {draft.otherSender &&
                <ContactFields draft={draft} errors={errors} update={update} nameField="senderName" phoneField="senderPhone" />}
            <SwitchRow label={t('priceStep.otraPersonaRecibeLaCarga')} value={draft.otherReceiver} onChange={(otherReceiver) => update({ otherReceiver })} />
            {draft.otherReceiver &&
                <ContactFields draft={draft} errors={errors} update={update} nameField="receiverName" phoneField="receiverPhone" />}

            <CheckboxRow
                label={t('priceStep.confirmoQueLaCargaNo')}
                value={draft.noProhibitedItems}
                onChange={(noProhibitedItems) => update({ noProhibitedItems })}
                error={errors.noProhibitedItems}
            />

            <ConfirmDialog
                visible={isTyping}
                title={t('priceStep.escribeTuPrecio')}
                message={t('priceStep.enPesosSinPuntosLo')}
                confirmLabel={t('priceStep.usarEstePrecio')}
                onConfirm={confirmTypedFare}
                onCancel={() => setIsTyping(false)}
            >
                <TextField
                    value={typedFare}
                    onChangeText={setTypedFare}
                    keyboardType="number-pad"
                    prefix="$"
                    placeholder="25000"
                    autoFocus
                    maxLength={9}
                    returnKeyType="done"
                    onSubmitEditing={confirmTypedFare}
                />
            </ConfirmDialog>
        </>
    );
}

interface ContactProps {
    draft: RequestDraft;
    errors: RequestDraftState['errors'];
    update: RequestDraftState['update'];
    nameField: 'senderName' | 'receiverName';
    phoneField: 'senderPhone' | 'receiverPhone';
}

function ContactFields({ draft, errors, update, nameField, phoneField }: ContactProps) {
    const { t } = useTranslation();
    return (
        <View style={styles.contact}>
            <View style={styles.flex}>
                <TextField label={t('common.nombre')} value={draft[nameField]} onChangeText={(value) => update({ [nameField]: value })} error={errors[nameField]} autoCapitalize="words" />
            </View>
            <View style={styles.flex}>
                <TextField label={t('common.celular')} value={draft[phoneField]} onChangeText={(value) => update({ [phoneField]: value.replace(/\D/g, '') })} error={errors[phoneField]} keyboardType="phone-pad" maxLength={10} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    price: {
        gap: spacing.sm,
    },
    recommended: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    flex: {
        flex: 1,
    },
    payment: {
        gap: spacing.sm,
    },
    contact: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
    },
});
