import { StyleSheet, Text, View } from "react-native";
import { ClientRequestResponse } from "../../domain/models/ClientRequestResponse";
import { cargoCategoryLabel, floorText, vehicleLabel } from "../utils/Cargo";
import { formatScheduledDate } from "../utils/Formatters";

interface Props {
    request: ClientRequestResponse;
    // Los contactos de entrega solo los ve el conductor asignado y el cliente
    showContacts?: boolean;
}

// Resumen de la carga, el cargue y descargue y la programación de un flete
export default function CargoInfo({ request, showContacts = false }: Props) {
    const tags = [
        request.is_fragile ? 'Frágil' : null,
        request.needs_cover ? 'Debe ir cubierta' : null,
        request.helpers ? `${request.helpers} ${request.helpers === 1 ? 'ayudante' : 'ayudantes'}` : null,
    ].filter(Boolean) as string[];
    const pickupFloor = floorText(request.pickup_floor, request.pickup_has_elevator);
    const destinationFloor = floorText(request.destination_floor, request.destination_has_elevator);

    return (
        <View>
            {request.scheduled_at && <Text style={styles.scheduled}>Programado: {formatScheduledDate(request.scheduled_at)}</Text>}
            <Text style={styles.line}>
                <Text style={styles.bold}>{cargoCategoryLabel(request.cargo_category)}</Text>
                {` · ${request.packages ?? 1} ${(request.packages ?? 1) === 1 ? 'bulto' : 'bultos'} · ${vehicleLabel(request.required_vehicle)}`}
            </Text>
            {request.cargo_description ? <Text style={styles.line}>{request.cargo_description}</Text> : null}
            <Text style={styles.line}>
                {request.weight_kg} kg · {request.length_cm} x {request.width_cm} x {request.height_cm} cm
            </Text>
            {tags.length > 0 &&
                <View style={styles.tags}>
                    {tags.map((tag) => <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>)}
                </View>}
            {(pickupFloor || destinationFloor) &&
                <Text style={styles.line}>Cargue: {pickupFloor ?? 'Primer piso'} · Descargue: {destinationFloor ?? 'Primer piso'}</Text>}
            {showContacts && request.sender_name &&
                <Text style={styles.line}>Entrega: {request.sender_name} · {request.sender_phone}</Text>}
            {showContacts && request.receiver_name &&
                <Text style={styles.line}>Recibe: {request.receiver_name} · {request.receiver_phone}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    line: {
        marginTop: 2,
    },
    bold: {
        fontWeight: 'bold',
    },
    scheduled: {
        fontWeight: 'bold',
        color: '#6200EE',
        marginBottom: 2,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 4,
        marginBottom: 2,
    },
    tag: {
        backgroundColor: '#fff3cd',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    tagText: {
        fontSize: 12,
    },
});
