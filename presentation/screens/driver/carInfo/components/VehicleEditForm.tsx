import { StyleSheet, View } from "react-native";
import { AppText, Button, ChipGroup, Notice, SwitchRow, TextField } from "../../../../components/ui";
import { VEHICLES } from "../../../../utils/Cargo";
import { spacing } from "../../../../theme";
import { VehicleForm, VehicleFormErrors } from "../DriverCarInfoViewModel";
import { useTranslation } from 'react-i18next';
import { vehicleRules } from "../../../../utils/VehicleRules";

interface Props {
    form: VehicleForm;
    errors: VehicleFormErrors;
    // "Lo normal en furgón es hasta 4.500 kg y 20 m³."
    typicalCapacity: string;
    // País del conductor: en Colombia la placa es ABC123; en otros países, libre
    countryCode?: string | null;
    saving: boolean;
    onChange: (changes: Partial<VehicleForm>) => void;
    onSave: () => void;
    onCancel: () => void;
}

// Cambiar de vehículo o corregir sus datos; si es más grande que el típico, su capacidad real
export default function VehicleEditForm({ form, errors, typicalCapacity, countryCode, saving, onChange, onSave, onCancel }: Props) {
    const rules = vehicleRules(countryCode);
    const { t } = useTranslation();
    return (
        <View style={styles.form}>
            <View style={styles.field}>
                <AppText variant="smallStrong">{t('vehicleEditForm.tipoDeVehiculo')}</AppText>
                <ChipGroup
                    options={VEHICLES.map((vehicle) => ({ value: vehicle.type, label: t(vehicle.label) }))}
                    selected={form.vehicleType}
                    onSelect={(vehicleType) => onChange({ vehicleType })}
                />
                {errors.vehicleType && <AppText variant="caption" color="danger">{errors.vehicleType}</AppText>}
            </View>
            <TextField label={t('vehicleEditForm.marcaYReferencia')} placeholder={t('vehicleEditForm.chevroletNhr')} value={form.brand} onChangeText={(brand) => onChange({ brand })} error={errors.brand} />
            <TextField label={t('vehicleEditForm.color')} placeholder={t('vehicleEditForm.blanco')} value={form.color} onChangeText={(color) => onChange({ color })} error={errors.color} />
            <View style={styles.row}>
                <View style={styles.flex}>
                    <TextField label={t('vehicleEditForm.placa')} placeholder={rules.platePlaceholder} value={form.plate} onChangeText={(plate) => onChange({ plate })} error={errors.plate} autoCapitalize="characters" maxLength={rules.plateMaxLength} />
                </View>
                <View style={styles.flex}>
                    <TextField label={t('vehicleEditForm.anoDelModelo')} placeholder="2019" value={form.modelYear} onChangeText={(modelYear) => onChange({ modelYear })} error={errors.modelYear} keyboardType="number-pad" maxLength={4} />
                </View>
            </View>
            <SwitchRow label={t('vehicleEditForm.carroceriaCerrada')} hint={t('vehicleEditForm.furgonOCarpaLaCarga')} value={form.isCovered} onChange={(isCovered) => onChange({ isCovered })} />

            <SwitchRow
                label={t('vehicleEditForm.esMasGrandeDeLo')}
                hint={t('vehicleEditForm.activaloSiElTuyoCarga', { typicalCapacity })}
                value={form.biggerThanUsual}
                onChange={(biggerThanUsual) => onChange({ biggerThanUsual })}
            />
            {form.biggerThanUsual &&
                <View style={styles.row}>
                    <View style={styles.flex}>
                        <TextField label={t('vehicleEditForm.cargaHastaKg')} placeholder="6000" value={form.capacityKg} onChangeText={(capacityKg) => onChange({ capacityKg })} error={errors.capacityKg} keyboardType="number-pad" maxLength={5} />
                    </View>
                    <View style={styles.flex}>
                        <TextField label={t('vehicleEditForm.espacioM')} placeholder="30" value={form.capacityM3} onChangeText={(capacityM3) => onChange({ capacityM3 })} error={errors.capacityM3} keyboardType="decimal-pad" maxLength={5} />
                    </View>
                </View>
            }
            {form.biggerThanUsual &&
                <Notice tone="info" message={t('vehicleEditForm.losClientesVenEstaCapacidad')} />}

            <Button title={t('vehicleEditForm.guardarCambios')} variant="dark" loading={saving} onPress={onSave} />
            <Button title={t('common.cancelar')} variant="text" disabled={saving} onPress={onCancel} />
        </View>
    );
}

const styles = StyleSheet.create({
    form: {
        gap: spacing.md,
    },
    field: {
        gap: spacing.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
    },
    flex: {
        flex: 1,
    },
});
