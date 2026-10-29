import { StyleSheet, View } from "react-native";
import { AppText, ChipGroup, Notice, SwitchRow, TextField, useToast } from "../../../../components/ui";
import PhotoStrip from "../../../../components/PhotoStrip";
import { spacing } from "../../../../theme";
import { VEHICLES, vehicleLabel, vehicleRank } from "../../../../utils/Cargo";
import { choosePhoto } from "../../../../utils/PhotoPicker";
import { RequestDraftState } from "../hooks/useRequestDraft";
import { MAX_CARGO_PHOTOS, RequestDraft } from "../RequestDraft";
import { SectionLabel, StepHeader } from "../components/StepParts";

const MEASURES: { field: 'lengthCm' | 'widthCm' | 'heightCm'; label: string }[] = [
    { field: 'lengthCm', label: 'Largo' },
    { field: 'widthCm', label: 'Ancho' },
    { field: 'heightCm', label: 'Alto' },
];

// Paso 3: medidas del artículo más grande, el vehículo, los cuidados y las fotos
export default function SizeStep({ state }: { state: RequestDraftState }) {
    const { draft, update, errors, step, suggestedVehicle } = state;
    const { showToast } = useToast();

    const addPhoto = async () => {
        const result = await choosePhoto('Foto de la carga');
        if (result.ok) update({ photos: [...draft.photos, result.uri] });
        else if (!result.cancelled) showToast(result.message, 'error');
    }

    return (
        <>
            <StepHeader title="Medidas y vehículo" step={step} />

            <View style={styles.measuresBlock}>
                <AppText variant="smallStrong">Medidas del artículo más grande (cm)</AppText>
                <View style={styles.measures}>
                    {MEASURES.map(({ field, label }) => (
                        <View key={field} style={styles.measure}>
                            <TextField
                                placeholder={label}
                                accessibilityLabel={`${label} en centímetros`}
                                value={draft[field]}
                                onChangeText={(value) => update({ [field]: value } as Partial<RequestDraft>)}
                                error={errors[field]}
                                keyboardType="decimal-pad"
                                style={styles.measureInput}
                            />
                        </View>
                    ))}
                </View>
            </View>

            {errors.vehicleType
                ? <Notice tone="danger" message={errors.vehicleType} />
                : suggestedVehicle &&
                <Notice tone="success" title={`Cabe en: ${vehicleLabel(suggestedVehicle)}`} message="Si quieres más espacio, elige uno más grande." />
            }
            <ChipGroup
                options={VEHICLES.map((vehicle) => ({
                    value: vehicle.type,
                    label: vehicle.label,
                    // Uno más pequeño que el sugerido no aguanta la carga
                    disabled: suggestedVehicle !== null && vehicleRank(vehicle.type) < vehicleRank(suggestedVehicle),
                }))}
                selected={draft.vehicleType ?? suggestedVehicle}
                onSelect={(vehicleType) => update({ vehicleType })}
            />

            <SectionLabel>Cuidados</SectionLabel>
            <SwitchRow label="Es frágil" value={draft.isFragile} onChange={(isFragile) => update({ isFragile })} />
            <SwitchRow label="Debe ir cubierta" hint="Por lluvia o polvo" value={draft.needsCover} onChange={(needsCover) => update({ needsCover })} />

            <SectionLabel>Fotos (opcional)</SectionLabel>
            <AppText variant="small" color="textMuted">Con fotos los conductores ofertan mejor, porque ven qué van a llevar.</AppText>
            <PhotoStrip
                items={draft.photos.map((uri) => ({ key: uri, localUri: uri }))}
                maxItems={MAX_CARGO_PHOTOS}
                onAdd={addPhoto}
                onRemove={(uri) => update({ photos: draft.photos.filter((photo) => photo !== uri) })}
            />
        </>
    );
}

const styles = StyleSheet.create({
    measuresBlock: {
        gap: spacing.xs,
    },
    measures: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    measure: {
        flex: 1,
    },
    measureInput: {
        textAlign: 'center',
    },
});
