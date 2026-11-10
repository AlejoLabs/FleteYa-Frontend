import { useCallback, useEffect, useState } from "react";
import { LatLng } from "react-native-maps";
import { useFocusEffect } from "@react-navigation/native";
import { ClientRequestResponse } from "../../../../../domain/models/ClientRequestResponse";
import { DriverDocument } from "../../../../../domain/models/DriverDocument";
import { DriverMyLocationMapViewModel } from "../DriverMyLocationMapViewModel";

// Datos del encabezado y de los avisos del inicio. Se recargan cada vez que el conductor vuelve a la pantalla
// (por ejemplo, después de entregar un flete o de mirar su vehículo). El vehículo lo trae useDriverApproval
// homeCurrency: la moneda del país del conductor (para el "Ganado hoy" en cero)
export function useDriverSummary(viewModel: DriverMyLocationMapViewModel, idDriver: number | undefined, location: LatLng | null, canWork: boolean | null, homeCurrency?: string, countryCode?: string) {
    const [trips, setTrips] = useState<ClientRequestResponse[]>([]);
    const [documents, setDocuments] = useState<DriverDocument[]>([]);
    const [nearby, setNearby] = useState<number | null>(null);
    const [focusCount, setFocusCount] = useState(0);

    useFocusEffect(useCallback(() => {
        if (!idDriver) return;
        let active = true;
        (async () => {
            const [finished, docs] = await Promise.all([
                viewModel.getFinishedTrips(idDriver),
                viewModel.getMyDocuments(),
            ]);
            if (!active) return;
            if (Array.isArray(finished)) setTrips(finished);
            if (Array.isArray(docs)) setDocuments(docs);
        })();
        setFocusCount((count) => count + 1);
        return () => {
            active = false;
        };
    }, [idDriver]));

    // Las solicitudes cercanas dependen de la ubicación: se cuentan con la primera y al volver a la pantalla.
    // Un conductor que todavía no puede trabajar no tiene solicitudes que contar
    const hasLocation = location !== null;
    useEffect(() => {
        if (!location || !canWork) return;
        let active = true;
        viewModel.countNearbyRequests(location.latitude, location.longitude).then((count) => {
            if (active) setNearby(count);
        });
        return () => {
            active = false;
        };
    }, [hasLocation, focusCount, canWork]);

    return {
        rating: viewModel.rating(trips),
        today: viewModel.daySummary(trips, homeCurrency),
        documentAlert: viewModel.documentAlert(documents, countryCode),
        nearby,
        // Llega una solicitud nueva: el conteo se actualiza sin esperar a volver a la pantalla
        setNearby,
    };
}
