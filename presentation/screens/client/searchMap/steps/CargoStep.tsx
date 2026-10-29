import { ChipGroup, Counter, Notice, SwitchRow, TextField } from "../../../../components/ui";
import { CARGO_CATEGORIES } from "../../../../utils/Cargo";
import { RequestDraftState } from "../hooks/useRequestDraft";
import { shortAddress } from "../RequestDraft";
import { SectionLabel, StepHeader, SummaryRow } from "../components/StepParts";

// Paso 2: qué es la carga, cuánto pesa, cuántos bultos y si necesita ayuda para cargarla y descargarla
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

            <SectionLabel>Cargue y descargue</SectionLabel>
            <SwitchRow
                label="¿Necesitas ayuda para cargar o descargar?"
                hint={draft.needsHelp ? undefined : 'El precio cubre solo el transporte: tú subes la carga y la recibes en el destino. El conductor la acomoda, la amarra y la lleva.'}
                value={draft.needsHelp}
                onChange={(needsHelp) => update({ needsHelp })}
            />
            {draft.needsHelp &&
                <>
                    <Counter label="Ayudantes" hint="Personas para cargar y descargar" value={draft.helpers} min={1} max={6} onChange={(helpers) => update({ helpers })} />
                    <Counter label="Piso donde se recoge" value={draft.pickupFloor} min={1} max={60} onChange={(pickupFloor) => update({ pickupFloor })} />
                    {draft.pickupFloor > 1 &&
                        <SwitchRow label="Hay ascensor en el origen" value={draft.pickupElevator} onChange={(pickupElevator) => update({ pickupElevator })} />}
                    <Counter label="Piso donde se entrega" value={draft.destinationFloor} min={1} max={60} onChange={(destinationFloor) => update({ destinationFloor })} />
                    {draft.destinationFloor > 1 &&
                        <SwitchRow label="Hay ascensor en el destino" value={draft.destinationElevator} onChange={(destinationElevator) => update({ destinationElevator })} />}
                    <Notice tone="cargo" message="Incluye en tu precio la ayuda que necesitas. El conductor lo tiene en cuenta al ofertar." />
                </>
            }
        </>
    );
}
