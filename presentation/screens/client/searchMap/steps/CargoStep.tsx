import { ChipGroup, Counter, Notice, SwitchRow, TextField } from "../../../../components/ui";
import { CARGO_CATEGORIES } from "../../../../utils/Cargo";
import { formatNumber, formatThousands } from "../../../../utils/Formatters";
import { RequestDraftState } from "../hooks/useRequestDraft";
import { shortAddress } from "../RequestDraft";
import { SectionLabel, StepHeader, SummaryRow } from "../components/StepParts";
import { useTranslation } from 'react-i18next';

// Paso 2: qué es la carga, cuánto pesa, cuántos artículos y si necesita ayuda para cargarla y descargarla
export default function CargoStep({ state }: { state: RequestDraftState }) {
    const { t } = useTranslation();
    const isPesos = !state.currency || state.currency === 'COP';
    const { draft, update, errors, step, goTo, routeSummary } = state;
    const routeText = `${shortAddress(draft.origin?.address)} → ${shortAddress(draft.destination?.address)}${routeSummary ? ` · ${routeSummary.distanceText}` : ''}`;

    return (
        <>
            <StepHeader title={t('cargoStep.queVasAMover')} step={step} />
            <SummaryRow icon="navigate-outline" text={routeText} onPress={() => goTo(0)} />

            <SectionLabel>{t('cargoStep.tipoDeCarga')}</SectionLabel>
            <ChipGroup options={CARGO_CATEGORIES.map((category) => ({ ...category, label: t(category.label) }))} selected={draft.category} onSelect={(category) => update({ category })} />

            <TextField
                label={t('cargoStep.describeLaCarga')}
                placeholder={t('cargoStep.neveraLavadoraY6Cajas')}
                value={draft.description}
                onChangeText={(description) => update({ description })}
                error={errors.description}
                maxLength={255}
            />
            <TextField
                label={t('cargoStep.pesoTotalKg')}
                placeholder="180"
                value={draft.weightKg}
                onChangeText={(weightKg) => update({ weightKg })}
                error={errors.weightKg}
                keyboardType="decimal-pad"
                hint={t('cargoStep.aproximadoEstaBien')}
            />
            <Counter label={t('cargoStep.articulos')} hint={t('cargoStep.unMotorEs1Una')} value={draft.packages} min={1} max={500} onChange={(packages) => update({ packages })} />
            <TextField
                label={t('cargoStep.valorAproximadoDeLaCarga')}
                // En la moneda del país de la recogida. En pesos, como siempre: "$" y punto de miles
                placeholder={isPesos ? "1.500.000" : formatNumber(2000, 0)}
                prefix={isPesos ? "$" : state.currency}
                // Se guardan solo los dígitos; en pantalla, con el separador de miles
                value={isPesos || !draft.declaredValue ? formatThousands(draft.declaredValue) : formatNumber(Number(draft.declaredValue), 0)}
                onChangeText={(declaredValue) => update({ declaredValue: declaredValue.replace(/\D/g, '') })}
                error={errors.declaredValue}
                keyboardType="number-pad"
                maxLength={13}
                hint={t('cargoStep.informativoQuedaEnElFlete')}
            />

            <SectionLabel>{t('cargoStep.cargueYDescargue')}</SectionLabel>
            <SwitchRow
                label={t('cargoStep.necesitasAyudaParaCargarO')}
                hint={draft.needsHelp ? undefined : t('cargoStep.elPrecioCubreSoloEl')}
                value={draft.needsHelp}
                onChange={(needsHelp) => update({ needsHelp })}
            />
            {draft.needsHelp &&
                <>
                    <Counter label={t('cargoStep.ayudantes')} hint={t('cargoStep.personasParaCargarYDescargar')} value={draft.helpers} min={1} max={6} onChange={(helpers) => update({ helpers })} />
                    <Counter label={t('cargoStep.pisoDondeSeRecoge')} value={draft.pickupFloor} min={1} max={60} onChange={(pickupFloor) => update({ pickupFloor })} />
                    {draft.pickupFloor > 1 &&
                        <SwitchRow label={t('cargoStep.hayAscensorEnElOrigen')} value={draft.pickupElevator} onChange={(pickupElevator) => update({ pickupElevator })} />}
                    <Counter label={t('cargoStep.pisoDondeSeEntrega')} value={draft.destinationFloor} min={1} max={60} onChange={(destinationFloor) => update({ destinationFloor })} />
                    {draft.destinationFloor > 1 &&
                        <SwitchRow label={t('cargoStep.hayAscensorEnElDestino')} value={draft.destinationElevator} onChange={(destinationElevator) => update({ destinationElevator })} />}
                    <Notice tone="cargo" message={t('cargoStep.incluyeEnTuPrecioLa')} />
                </>
            }
        </>
    );
}
