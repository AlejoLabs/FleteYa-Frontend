import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppText, CheckboxRow, Chip, ConfirmDialog, PriceStepper, SwitchRow, TextField } from "../../../../components/ui";
import { spacing } from "../../../../theme";
import { cargoCategoryLabel, vehicleLabel } from "../../../../utils/Cargo";
import { formatCOP } from "../../../../utils/Formatters";
import { RequestDraftState } from "../hooks/useRequestDraft";
import { FARE_STEP, RequestDraft } from "../RequestDraft";
import SchedulePicker from "../components/SchedulePicker";
import { SectionLabel, StepHeader, SummaryRow } from "../components/StepParts";

interface Props {
    state: RequestDraftState;
}

// Paso 4: cuándo, cuánto ofrece el cliente, quién entrega y recibe, y la confirmación de que la carga se puede llevar
export default function PriceStep({ state }: Props) {
    const { draft, update, errors, step, goTo, recommendedFare, suggestedVehicle, pricing } = state;
    const [isTyping, setIsTyping] = useState(false);
    const [typedFare, setTypedFare] = useState('');

    const cargoText = [
        cargoCategoryLabel(draft.category),
        `${draft.packages} ${draft.packages === 1 ? 'bulto' : 'bultos'}`,
        vehicleLabel(draft.vehicleType ?? suggestedVehicle),
    ].join(' · ');

    const confirmTypedFare = () => {
        const value = Math.round(Number(typedFare.replace(/\D/g, '')) / 100) * 100;
        if (value > 0) update({ fare: value });
        setIsTyping(false);
    }

    return (
        <>
            <StepHeader title="¿Cuándo y por cuánto?" step={step} />
            <SummaryRow icon="cube-outline" text={cargoText} onPress={() => goTo(1)} />

            <SectionLabel>Cuándo</SectionLabel>
            <SchedulePicker value={draft.scheduledAt} onChange={(scheduledAt) => update({ scheduledAt })} />

            <SectionLabel>Tu precio</SectionLabel>
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
                            Sugerido {formatCOP(recommendedFare)}{pricing ? ` por ${pricing.distance.text}` : ''}
                            {draft.needsHelp
                                ? ', solo por el transporte. Súbelo si quieres que incluya la ayuda para cargar y descargar.'
                                : '. Cubre solo el transporte de la carga.'}
                            {' '}Toca el precio para escribirlo.
                        </AppText>
                        {draft.fare !== recommendedFare && <Chip label="Usar sugerido" onPress={() => update({ fare: recommendedFare })} />}
                    </View>
                    : <AppText variant="small" color="textMuted">Calculando el precio sugerido…</AppText>
                }
            </View>

            <SectionLabel>Contactos</SectionLabel>
            <SwitchRow label="Otra persona entrega la carga" value={draft.otherSender} onChange={(otherSender) => update({ otherSender })} />
            {draft.otherSender &&
                <ContactFields draft={draft} errors={errors} update={update} nameField="senderName" phoneField="senderPhone" />}
            <SwitchRow label="Otra persona recibe la carga" value={draft.otherReceiver} onChange={(otherReceiver) => update({ otherReceiver })} />
            {draft.otherReceiver &&
                <ContactFields draft={draft} errors={errors} update={update} nameField="receiverName" phoneField="receiverPhone" />}

            <CheckboxRow
                label="Confirmo que la carga no es material peligroso (inflamable, explosivo, químico) ni animales."
                value={draft.noProhibitedItems}
                onChange={(noProhibitedItems) => update({ noProhibitedItems })}
                error={errors.noProhibitedItems}
            />

            <ConfirmDialog
                visible={isTyping}
                title="Escribe tu precio"
                message="En pesos, sin puntos. Lo redondeamos a cientos."
                confirmLabel="Usar este precio"
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
    return (
        <View style={styles.contact}>
            <View style={styles.flex}>
                <TextField label="Nombre" value={draft[nameField]} onChangeText={(value) => update({ [nameField]: value })} error={errors[nameField]} autoCapitalize="words" />
            </View>
            <View style={styles.flex}>
                <TextField label="Celular" value={draft[phoneField]} onChangeText={(value) => update({ [phoneField]: value.replace(/\D/g, '') })} error={errors[phoneField]} keyboardType="phone-pad" maxLength={10} />
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
    contact: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
    },
});
