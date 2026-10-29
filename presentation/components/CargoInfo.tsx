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
}

// Resumen de la carga, el cargue y descargue y la programación de un flete
export default function CargoInfo({ request, showContacts = false }: Props) {
    const packages = request.packages ?? 1;
    const tags = [
        request.is_fragile ? 'Frágil' : null,
        request.needs_cover ? 'Debe ir cubierta' : null,
        request.helpers ? `${request.helpers} ${request.helpers === 1 ? 'ayudante' : 'ayudantes'}` : null,
    ].filter(Boolean) as string[];
    const pickupFloor = floorText(request.pickup_floor, request.pickup_has_elevator);
    const destinationFloor = floorText(request.destination_floor, request.destination_has_elevator);
    const measures = request.length_cm ? `${request.length_cm} × ${request.width_cm} × ${request.height_cm} cm` : null;

    return (
        <View style={styles.box}>
            {request.scheduled_at && <StatusPill tone="cargo" label={`Programado: ${formatScheduledDate(request.scheduled_at)}`} />}
            <AppText variant="smallStrong">
                {[cargoCategoryLabel(request.cargo_category), `${packages} ${packages === 1 ? 'bulto' : 'bultos'}`, request.weight_kg ? `${request.weight_kg} kg` : null]
                    .filter(Boolean).join(' · ')}
            </AppText>
            {request.cargo_description ? <AppText variant="small" color="textMuted">{request.cargo_description}</AppText> : null}
            <AppText variant="small" color="textMuted">
                {[vehicleLabel(request.required_vehicle), measures].filter(Boolean).join(' · ')}
            </AppText>
            {(pickupFloor || destinationFloor) &&
                <AppText variant="small" color="textMuted">Cargue: {pickupFloor ?? 'primer piso'} · Descargue: {destinationFloor ?? 'primer piso'}</AppText>}
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
