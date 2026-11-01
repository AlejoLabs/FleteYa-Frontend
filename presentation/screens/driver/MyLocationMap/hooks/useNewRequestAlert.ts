import { useEffect, useRef, useState } from "react";
import { Vibration } from "react-native";
import { LatLng } from "react-native-maps";
import { ClientRequestResponse } from "../../../../../domain/models/ClientRequestResponse";
import { DriverMyLocationMapViewModel } from "../DriverMyLocationMapViewModel";

// Tiempo que la tarjeta queda a la vista antes de irse sola
const ALERT_MS = 15000;

// Solicitud nueva mientras el conductor está disponible en el inicio: se muestra en una tarjeta solo si le aparece en
// su lista (cerca y cabe en su vehículo). También actualiza cuántas solicitudes tiene cerca
export function useNewRequestAlert(
    viewModel: DriverMyLocationMapViewModel,
    available: boolean,
    location: LatLng | null,
    isFocused: boolean,
    onNearbyCount: (count: number) => void,
) {
    const [alert, setAlert] = useState<ClientRequestResponse | null>(null);
    // El aviso del socket llega a una función registrada una vez: lee lo último por referencia
    const latest = useRef({ location, isFocused, onNearbyCount });
    latest.current = { location, isFocused, onNearbyCount };
    // El aviso puede llegar dos veces (del servidor y de la app del cliente): cada solicitud se muestra una sola vez
    const shown = useRef(new Set<number>());

    useEffect(() => {
        if (!available) {
            setAlert(null);
            return;
        }
        viewModel.initSocket();
        return viewModel.listenerNewClientRequest(async (idClientRequest) => {
            const { location: current, isFocused: focused } = latest.current;
            if (!current || shown.current.has(idClientRequest)) return;
            shown.current.add(idClientRequest);
            const requests = await viewModel.getNearbyRequests(current.latitude, current.longitude);
            if (!requests) return;
            latest.current.onNearbyCount(requests.length);
            const found = requests.find((request) => request.id === idClientRequest);
            if (found && focused) {
                setAlert(found);
                Vibration.vibrate(300);
            }
        });
    }, [available]);

    useEffect(() => {
        if (!alert) return;
        const timer = setTimeout(() => setAlert(null), ALERT_MS);
        return () => clearTimeout(timer);
    }, [alert]);

    return { alert, dismiss: () => setAlert(null) };
}
