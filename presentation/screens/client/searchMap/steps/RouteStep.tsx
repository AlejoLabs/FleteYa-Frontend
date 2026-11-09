import { AppText, Notice } from "../../../../components/ui";
import { RequestDraftState } from "../hooks/useRequestDraft";
import { PlaceRow, StepHeader } from "../components/StepParts";
import { useTranslation } from 'react-i18next';

interface Props {
    state: RequestDraftState;
    onSearchOrigin: () => void;
    onSearchDestination: () => void;
    // Ubicación apagada o sin permiso: el mapa no se centró solo
    locationUnavailable: boolean;
}

// Paso 1: el origen es donde está el pin (o una dirección buscada) y el destino se busca
export default function RouteStep({ state, onSearchOrigin, onSearchDestination, locationUnavailable }: Props) {
    const { t } = useTranslation();
    const { draft, errors, routeSummary, step } = state;
    return (
        <>
            <StepHeader title={t('routeStep.aDondeLlevamosLaCarga')} step={step} />
            {locationUnavailable &&
                <Notice tone="info" message={t('routeStep.noPudimosVerTuUbicacion')} />}
            <PlaceRow
                tone="origin"
                label={t('routeStep.recogerEn')}
                value={draft.origin?.address}
                placeholder={t('routeStep.mueveElMapaHastaEl')}
                error={errors.origin}
                actionLabel={t('routeStep.buscar')}
                onPress={onSearchOrigin}
            />
            <PlaceRow
                tone="destination"
                label={t('routeStep.llevarA')}
                value={draft.destination?.address}
                placeholder={t('routeStep.eligeElDestino')}
                error={errors.destination}
                actionLabel={draft.destination ? t('routeStep.cambiar') : t('routeStep.buscar')}
                onPress={onSearchDestination}
            />
            {routeSummary &&
                <AppText variant="small" color="textMuted">{t('routeStep.recorridoDeUnos', { distanceText: routeSummary.distanceText, durationText: routeSummary.durationText })}</AppText>}
        </>
    );
}
