import { AppText } from "../../../../components/ui";
import { RequestDraftState } from "../hooks/useRequestDraft";
import { PlaceRow, StepActions, StepHeader } from "../components/StepParts";

interface Props {
    state: RequestDraftState;
    onSearchOrigin: () => void;
    onSearchDestination: () => void;
}

// Paso 1: el origen es donde está el pin (o una dirección buscada) y el destino se busca
export default function RouteStep({ state, onSearchOrigin, onSearchDestination }: Props) {
    const { draft, errors, routeSummary, step, next } = state;
    return (
        <>
            <StepHeader title="¿A dónde llevamos la carga?" step={step} />
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
            <StepActions onNext={next} />
        </>
    );
}
