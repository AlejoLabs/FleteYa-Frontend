import { AppText, Notice } from "../../../../components/ui";
import { RequestDraftState } from "../hooks/useRequestDraft";
import { PlaceRow, StepHeader } from "../components/StepParts";

interface Props {
    state: RequestDraftState;
    onSearchOrigin: () => void;
    onSearchDestination: () => void;
    // Ubicación apagada o sin permiso: el mapa no se centró solo
    locationUnavailable: boolean;
}

// Paso 1: el origen es donde está el pin (o una dirección buscada) y el destino se busca
export default function RouteStep({ state, onSearchOrigin, onSearchDestination, locationUnavailable }: Props) {
    const { draft, errors, routeSummary, step } = state;
    return (
        <>
            <StepHeader title="¿A dónde llevamos la carga?" step={step} />
            {locationUnavailable &&
                <Notice tone="info" message="No pudimos ver tu ubicación. Mueve el mapa hasta el punto de recogida o búscalo con Buscar." />}
            <PlaceRow
                tone="origin"
                label="Recoger en"
                value={draft.origin?.address}
                placeholder="Mueve el mapa hasta el punto de recogida"
                error={errors.origin}
                actionLabel="Buscar"
                onPress={onSearchOrigin}
            />
            <PlaceRow
                tone="destination"
                label="Llevar a"
                value={draft.destination?.address}
                placeholder="Elige el destino"
                error={errors.destination}
                actionLabel={draft.destination ? 'Cambiar' : 'Buscar'}
                onPress={onSearchDestination}
            />
            {routeSummary &&
                <AppText variant="small" color="textMuted">Recorrido de {routeSummary.distanceText} · unos {routeSummary.durationText}</AppText>}
        </>
    );
}
