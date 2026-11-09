import { StyleSheet, View } from "react-native";
import { AppText, ChipGroup, Notice, SwitchRow, TextField, useToast } from "../../../../components/ui";
import PhotoStrip from "../../../../components/PhotoStrip";
import { spacing } from "../../../../theme";
import { VEHICLES, vehicleLabel, vehicleRank } from "../../../../utils/Cargo";
import { choosePhoto } from "../../../../utils/PhotoPicker";
import { RequestDraftState } from "../hooks/useRequestDraft";
import { MAX_CARGO_PHOTOS, RequestDraft } from "../RequestDraft";
import { SectionLabel, StepHeader } from "../components/StepParts";
import { useTranslation } from 'react-i18next';
import { t, tk } from '../../../../../i18n';

const MEASURES: { field: 'lengthCm' | 'widthCm' | 'heightCm'; label: string }[] = [
    { field: 'lengthCm', label: tk('sizeStep.largo') },
    { field: 'widthCm', label: tk('sizeStep.ancho') },
    { field: 'heightCm', label: tk('sizeStep.alto') },
];

// Paso 3: medidas del artículo más grande, el vehículo, los cuidados y las fotos
export default function SizeStep({ state }: { state: RequestDraftState }) {
    const { t } = useTranslation();
    const { draft, update, errors, step, suggestedVehicle } = state;
    const { showToast } = useToast();

    const addPhoto = async () => {
        const result = await choosePhoto(t('sizeStep.fotoDeLaCarga'));
        if (result.ok) update({ photos: [...draft.photos, result.uri] });
        else if (!result.cancelled) showToast(result.message, 'error');
    }

    return (
        <>
            <StepHeader title={t('sizeStep.medidasYVehiculo')} step={step} />

            <View style={styles.measuresBlock}>
                <AppText variant="smallStrong">{t('sizeStep.medidasDelArticuloMasGrande')}</AppText>
                <View style={styles.measures}>
                    {MEASURES.map(({ field, label: labelKey }) => { const label = t(labelKey); return (
                        <View key={field} style={styles.measure}>
                            <TextField
                                placeholder={label}
                                accessibilityLabel={t('sizeStep.enCentimetros', { label })}
                                value={draft[field]}
                                onChangeText={(value) => update({ [field]: value } as Partial<RequestDraft>)}
                                error={errors[field]}
                                keyboardType="decimal-pad"
                                style={styles.measureInput}
                            />
                        </View>
                    ); })}
                </View>
            </View>

            {errors.vehicleType
                ? <Notice tone="danger" message={errors.vehicleType} />
                : suggestedVehicle &&
                <Notice tone="success" title={t('sizeStep.cabeEn', { vehicleLabel: vehicleLabel(suggestedVehicle) })} message={t('sizeStep.siQuieresMasEspacioElige')} />
            }
            <ChipGroup
                options={VEHICLES.map((vehicle) => ({
                    value: vehicle.type,
                    label: t(vehicle.label),
                    // Uno más pequeño que el sugerido no aguanta la carga
                    disabled: suggestedVehicle !== null && vehicleRank(vehicle.type) < vehicleRank(suggestedVehicle),
                }))}
                selected={draft.vehicleType ?? suggestedVehicle}
                onSelect={(vehicleType) => update({ vehicleType })}
            />

            <SectionLabel>{t('sizeStep.cuidados')}</SectionLabel>
            <SwitchRow label={t('sizeStep.esFragil')} value={draft.isFragile} onChange={(isFragile) => update({ isFragile })} />
            <SwitchRow label={t('sizeStep.debeIrCubierta')} hint={t('sizeStep.porLluviaOPolvo')} value={draft.needsCover} onChange={(needsCover) => update({ needsCover })} />

            <SectionLabel>{t('sizeStep.fotosOpcional')}</SectionLabel>
            <AppText variant="small" color="textMuted">{t('sizeStep.conFotosLosConductoresOfertan')}</AppText>
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
