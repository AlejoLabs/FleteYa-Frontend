import { ChipGroup, Counter, Notice, TextField } from "../../../../components/ui";
import { CARGO_CATEGORIES } from "../../../../utils/Cargo";
import { RequestDraftState } from "../hooks/useRequestDraft";
import { shortAddress } from "../RequestDraft";
import { SectionLabel, StepHeader, SummaryRow } from "../components/StepParts";

// Paso 2: qué es la carga, cuánto pesa, cuántos bultos y si hacen falta ayudantes
export default function CargoStep({ state }: { state: RequestDraftState }) {
    const { draft, update, errors, step, goTo, routeSummary } = state;
    const routeText = `${shortAddress(draft.origin?.address)} → ${shortAddress(draft.destination?.address)}${routeSummary ? ` · ${routeSummary.distanceText}` : ''}`;

    return (
        <>
            <StepHeader title="¿Qué vas a mover?" step={step} />
            <SummaryRow icon="navigate-outline" text={routeText} onPress={() => goTo(0)} />

            <SectionLabel>Tipo de carga</SectionLabel>
            <ChipGroup options={CARGO_CATEGORIES} selected={draft.category} onSelect={(category) => update({ category })} />

            <TextField
                label="Describe la carga"
                placeholder="Nevera, lavadora y 6 cajas"
                value={draft.description}
                onChangeText={(description) => update({ description })}
                error={errors.description}
                maxLength={255}
            />
            <TextField
                label="Peso total (kg)"
                placeholder="180"
                value={draft.weightKg}
                onChangeText={(weightKg) => update({ weightKg })}
                error={errors.weightKg}
                keyboardType="decimal-pad"
                hint="Aproximado está bien"
            />
            <Counter label="Bultos" value={draft.packages} min={1} max={500} onChange={(packages) => update({ packages })} />
            <Counter label="Ayudantes" hint="Para cargar y descargar" value={draft.helpers} min={0} max={6} onChange={(helpers) => update({ helpers })} />
            <Notice tone="cargo" message="En el siguiente paso pides las medidas del bulto más grande y te sugerimos el vehículo." />
        </>
    );
}
