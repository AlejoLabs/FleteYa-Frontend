import { useEffect, useRef, useState } from "react";
import { LatLng } from "react-native-maps";
import { decode } from "@googlemaps/polyline-codec";
import { TimeAndDistanceValues } from "../../../../../domain/models/TimeAndDistanceValues";
import { ErrorResponse } from "../../../../../domain/models/ErrorResponse";
import { ClientSearchMapViewModel } from "../ClientSearchMapViewModel";
import { formatKm } from "../../../../utils/Formatters";
import { DraftErrors, EMPTY_DRAFT, PlacePoint, RequestDraft, REQUEST_STEPS, hasSize, sizeM3, suggestedVehicleFor, weightKg } from "../RequestDraft";

export interface RouteSummary {
    distanceText: string;
    durationText: string;
}

// Estado de la solicitud mientras el cliente la arma: datos, paso actual, ruta en el mapa y precio sugerido
export function useRequestDraft(viewModel: ClientSearchMapViewModel) {

    const [draft, setDraft] = useState<RequestDraft>(EMPTY_DRAFT);
    const [errors, setErrors] = useState<DraftErrors>({});
    const [step, setStep] = useState(0);
    const [route, setRoute] = useState<LatLng[]>([]);
    const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
    const [pricing, setPricing] = useState<TimeAndDistanceValues | null>(null);
    const pricingRequestId = useRef(0);
    const geocodeRequestId = useRef(0);

    const recommendedFare = viewModel.recommendedFare(pricing ?? undefined);
    const suggestedVehicle = suggestedVehicleFor(draft);

    // Cambiar un dato quita su error: el aviso solo vuelve si se intenta seguir otra vez
    const update = (changes: Partial<RequestDraft>) => {
        setDraft((prev) => ({ ...prev, ...changes }));
        setErrors((prev) => {
            const next = { ...prev };
            (Object.keys(changes) as (keyof RequestDraft)[]).forEach((field) => delete next[field]);
            return next;
        });
    }

    useEffect(() => {
        const { origin, destination } = draft;
        if (!origin || !destination) {
            setRoute([]);
            setRouteSummary(null);
            return;
        }
        viewModel.getDirections(
            { latitude: origin.lat, longitude: origin.lng },
            { latitude: destination.lat, longitude: destination.lng },
        ).then((response) => {
            const first = response?.routes[0];
            if (!first) return;
            setRoute(decode(first.overview_polyline.points).map(([lat, lng]) => ({ latitude: lat, longitude: lng })));
            const leg = first.legs[0];
            if (leg) setRouteSummary({ distanceText: formatKm(leg.distance.value), durationText: leg.duration.text });
        });
    }, [draft.origin, draft.destination]);

    // El precio sugerido depende de la ruta, el peso, el tamaño y el vehículo; una respuesta vieja que llegue tarde no pisa la última
    const pricedVehicle = draft.vehicleType ?? suggestedVehicle;
    useEffect(() => {
        const { origin, destination } = draft;
        if (!origin || !destination || !hasSize(draft)) {
            setPricing(null);
            return;
        }
        const requestId = ++pricingRequestId.current;
        viewModel.getTimeAndDistance(
            { latitude: origin.lat, longitude: origin.lng },
            { latitude: destination.lat, longitude: destination.lng },
            weightKg(draft),
            sizeM3(draft),
            pricedVehicle ?? undefined,
        ).then((response: TimeAndDistanceValues | ErrorResponse) => {
            if (requestId !== pricingRequestId.current) return;
            if ('distance' in response) setPricing(response);
        });
    }, [draft.origin, draft.destination, draft.weightKg, draft.lengthCm, draft.widthCm, draft.heightCm, pricedVehicle]);

    // Al llegar al precio, se arranca con el sugerido; si el cliente ya escribió uno, se respeta
    useEffect(() => {
        if (step === 3 && draft.fare === 0 && recommendedFare > 0) update({ fare: recommendedFare });
    }, [step, recommendedFare]);

    // El centro del mapa es el origen mientras se elige la ruta
    const setOriginFromMap = async (lat: number, lng: number) => {
        const requestId = ++geocodeRequestId.current;
        const response = await viewModel.getPlaceDetailsByCoords(lat, lng);
        // Al iniciar, el mapa puede reportar un punto sin dirección (ZERO_RESULTS); se ignora hasta tener uno válido
        if (requestId !== geocodeRequestId.current) return;
        if (response?.status === 'OK' && response.results.length > 0) {
            update({ origin: { lat, lng, address: response.results[0].formatted_address } });
        }
    }

    // Google responde 200 aunque falle (REQUEST_DENIED, NOT_FOUND...); sin result no hay coordenadas
    const placeFromId = async (placeId: string): Promise<PlacePoint | null> => {
        const response = await viewModel.getPlaceDetails(placeId);
        if (response?.status !== 'OK' || !response.result) return null;
        const { lat, lng } = response.result.geometry.location;
        return { lat, lng, address: response.result.formatted_address };
    }

    // Marca los errores del paso actual y dice si se puede seguir
    const validate = () => {
        const problems = viewModel.validateStep(step, draft);
        setErrors(problems);
        return Object.keys(problems).length === 0;
    }

    const next = () => {
        if (validate()) setStep((current) => Math.min(current + 1, REQUEST_STEPS.length - 1));
    }

    const back = () => {
        setErrors({});
        setStep((current) => Math.max(current - 1, 0));
    }

    const goTo = (target: number) => {
        setErrors({});
        setStep(target);
    }

    // Tras publicar se deja el formulario limpio para el siguiente flete
    const reset = () => {
        setDraft(EMPTY_DRAFT);
        setErrors({});
        setStep(0);
        setPricing(null);
    }

    return {
        draft, update, errors, step, validate, next, back, goTo, reset,
        route, routeSummary, pricing, recommendedFare, suggestedVehicle,
        setOriginFromMap, placeFromId,
    };
}

export type RequestDraftState = ReturnType<typeof useRequestDraft>;
