import { useRef, useState } from "react";
import { LatLng } from "react-native-maps";
import { decode } from "@googlemaps/polyline-codec";
import { GoogleDirections } from "../../../../domain/models/GoogleDirections";

interface DirectionsSource {
    getDirections: (origin: LatLng, destination: LatLng) => Promise<GoogleDirections | null>;
}

// Recorrido del vehículo hasta el punto que toca (recogida o destino) y los minutos que le faltan según Google
export function useTripRoute(viewModel: DirectionsSource) {
    const [route, setRoute] = useState<LatLng[]>([]);
    const [etaMinutes, setEtaMinutes] = useState<number | null>(null);
    // Si se piden dos rutas seguidas (llegó la ubicación y cambió el estado), solo cuenta la última
    const lastRequest = useRef(0);

    const loadRoute = async (origin: LatLng, destination: LatLng) => {
        const requestId = ++lastRequest.current;
        const response = await viewModel.getDirections(origin, destination);
        if (requestId !== lastRequest.current) return;
        const first = response?.routes?.[0];
        if (!first) return;
        setRoute(decode(first.overview_polyline.points).map(([latitude, longitude]) => ({ latitude, longitude })));
        const seconds = first.legs?.[0]?.duration?.value;
        setEtaMinutes(typeof seconds === 'number' && seconds > 0 ? Math.max(1, Math.round(seconds / 60)) : null);
    }

    return { route, etaMinutes, loadRoute };
}
