import { StyleSheet, View } from "react-native";
import { ClientRequestResponse } from "../../domain/models/ClientRequestResponse";
import { cargoCategoryLabel, floorText, vehicleLabel } from "../utils/Cargo";
import { formatScheduledDate } from "../utils/Formatters";
import { AppText, StatusPill } from "./ui";
import { colors, radius, spacing } from "../theme";

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
        return { needsHelp: false, text: audience === 'client' ? 'Solo transporte: tú subes y recibes la carga.' : 'Solo transporte: el cliente sube y recibe la carga.' };
    }
    const pickupFloor = request.pickup_floor && request.pickup_floor > 1 ? floorText(request.pickup_floor, request.pickup_has_elevator) : null;
    const destinationFloor = request.destination_floor && request.destination_floor > 1 ? floorText(request.destination_floor, request.destination_has_elevator) : null;
    const details = [
        `${helpers} ${helpers === 1 ? 'ayudante' : 'ayudantes'}`,
        pickupFloor ? `cargue en ${pickupFloor.toLowerCase()}` : null,
        destinationFloor ? `descargue en ${destinationFloor.toLowerCase()}` : null,
    ].filter(Boolean).join(' · ');
    return { needsHelp: true, text: `Necesita ayuda: ${details}.${offerHint ? ' Inclúyelo en tu oferta.' : ''}` };
}

// Resumen de la carga, el cargue y descargue y la programación de un flete
export default function CargoInfo({ request, showContacts = false, audience = 'driver', offerHint = false }: Props) {
    const packages = request.packages ?? 1;
    const tags = [
        request.is_fragile ? 'Frágil' : null,
        request.needs_cover ? 'Debe ir cubierta' : null,
    ].filter(Boolean) as string[];
    const help = helpText(request, audience, offerHint);
    const measures = request.length_cm ? `${request.length_cm} × ${request.width_cm} × ${request.height_cm} cm` : null;

    return (
        <View style={styles.box}>
            {request.scheduled_at && <StatusPill tone="cargo" label={`Programado: ${formatScheduledDate(request.scheduled_at)}`} />}
            <AppText variant="smallStrong">
                {[cargoCategoryLabel(request.cargo_category), `${packages} ${packages === 1 ? 'artículo' : 'artículos'}`, request.weight_kg ? `${request.weight_kg} kg` : null]
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
                <AppText variant="small">Entrega: {request.sender_name} · {request.sender_phone}</AppText>}
            {showContacts && request.receiver_name &&
                <AppText variant="small">Recibe: {request.receiver_name} · {request.receiver_phone}</AppText>}
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
