import { StyleSheet, View } from "react-native";
import { ClientRequestResponse } from "../../domain/models/ClientRequestResponse";
import { cargoCategoryLabel, floorText, vehicleLabel } from "../utils/Cargo";
import { formatScheduledDate } from "../utils/Formatters";
import { AppText, StatusPill } from "./ui";
import { colors, radius, spacing } from "../theme";
import { useTranslation } from 'react-i18next';
import { t, lowerInSentence } from '../../i18n';

interface Props {
    request: ClientRequestResponse;
    // Los contactos de entrega solo los ve el conductor asignado y el cliente
    showContacts?: boolean;
    // Quién lo lee: cambia cómo se dice quién sube la carga
    audience?: 'driver' | 'client';
    // En la lista de solicitudes, recordarle al conductor que la ayuda va dentro de su oferta
    offerHint?: boolean;
}

// El precio cubre solo el transporte; si el cliente pidió ayuda, dice cuánta y en qué pisos para que el conductor la incluya
const helpText = (request: ClientRequestResponse, audience: 'driver' | 'client', offerHint: boolean) => {
    const helpers = request.helpers ?? 0;
    if (helpers === 0) {
        return { needsHelp: false, text: audience === 'client' ? t('cargoInfo.soloTransporteTuSubesY') : t('cargoInfo.soloTransporteElClienteSube') };
    }
    const pickupFloor = request.pickup_floor && request.pickup_floor > 1 ? floorText(request.pickup_floor, request.pickup_has_elevator) : null;
    const destinationFloor = request.destination_floor && request.destination_floor > 1 ? floorText(request.destination_floor, request.destination_has_elevator) : null;
    const details = [
        t('cargoInfo.ayudantes', { count: helpers }),
        pickupFloor ? t('cargoInfo.cargueEn', { pickupFloor: lowerInSentence(pickupFloor) }) : null,
        destinationFloor ? t('cargoInfo.descargueEn', { destinationFloor: lowerInSentence(destinationFloor) }) : null,
    ].filter(Boolean).join(' · ');
    return { needsHelp: true, text: t('cargoInfo.necesitaAyuda', { details }) + (offerHint ? ' ' + t('cargoInfo.incluyeloEnTuOferta') : '') };
}

// Resumen de la carga, el cargue y descargue y la programación de un flete
export default function CargoInfo({ request, showContacts = false, audience = 'driver', offerHint = false }: Props) {
    const { t } = useTranslation();
    const packages = request.packages ?? 1;
    const tags = [
        request.is_fragile ? t('cargoInfo.fragil') : null,
        request.needs_cover ? t('cargoInfo.debeIrCubierta') : null,
    ].filter(Boolean) as string[];
    const help = helpText(request, audience, offerHint);
    const measures = request.length_cm ? t('cargoInfo.cm', { length_cm: request.length_cm, width_cm: request.width_cm, height_cm: request.height_cm }) : null;

    return (
        <View style={styles.box}>
            {request.scheduled_at && <StatusPill tone="cargo" label={t('cargoInfo.programado', { scheduledDate: formatScheduledDate(request.scheduled_at) })} />}
            <AppText variant="smallStrong">
                {[cargoCategoryLabel(request.cargo_category), t('common.articulos', { count: packages }), request.weight_kg ? t('common.kg', { value: request.weight_kg }) : null]
                    .filter(Boolean).join(' · ')}
            </AppText>
            {request.cargo_description ? <AppText variant="small" color="textMuted">{request.cargo_description}</AppText> : null}
            <AppText variant="small" color="textMuted">
                {[vehicleLabel(request.required_vehicle), measures].filter(Boolean).join(' · ')}
            </AppText>
            <AppText variant={help.needsHelp ? 'smallStrong' : 'small'} color={help.needsHelp ? 'warning' : 'textMuted'}>{help.text}</AppText>
            {tags.length > 0 &&
                <View style={styles.tags}>
                    {tags.map((tag) => <StatusPill key={tag} label={tag} tone="warning" />)}
                </View>}
            {showContacts && request.sender_name &&
                <AppText variant="small">{t('cargoInfo.entrega', { sender_name: request.sender_name, sender_phone: request.sender_phone })}</AppText>}
            {showContacts && request.receiver_name &&
                <AppText variant="small">{t('cargoInfo.recibe', { receiver_name: request.receiver_name, receiver_phone: request.receiver_phone })}</AppText>}
        </View>
    );
}

const styles = StyleSheet.create({
    box: {
        gap: spacing.xs,
        padding: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceMuted,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
        marginTop: spacing.xxs,
    },
});
