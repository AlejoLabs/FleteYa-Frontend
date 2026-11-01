import { StyleSheet, View } from "react-native";
import { AppText, Button, ChipGroup, Notice, SwitchRow, TextField } from "../../../../components/ui";
import { VEHICLES } from "../../../../utils/Cargo";
import { spacing } from "../../../../theme";
import { VehicleForm, VehicleFormErrors } from "../DriverCarInfoViewModel";

interface Props {
    form: VehicleForm;
    errors: VehicleFormErrors;
    // "Lo normal en furgón es hasta 4.500 kg y 20 m³."
    typicalCapacity: string;
    saving: boolean;
    onChange: (changes: Partial<VehicleForm>) => void;
    onSave: () => void;
    onCancel: () => void;
}

// Cambiar de vehículo o corregir sus datos; si es más grande que el típico, su capacidad real
export default function VehicleEditForm({ form, errors, typicalCapacity, saving, onChange, onSave, onCancel }: Props) {
    return (
        <View style={styles.form}>
            <View style={styles.field}>
                <AppText variant="smallStrong">Tipo de vehículo</AppText>
                <ChipGroup
                    options={VEHICLES.map((vehicle) => ({ value: vehicle.type, label: vehicle.label }))}
                    selected={form.vehicleType}
                    onSelect={(vehicleType) => onChange({ vehicleType })}
                />
                {errors.vehicleType && <AppText variant="caption" color="danger">{errors.vehicleType}</AppText>}
            </View>
            <TextField label="Marca y referencia" placeholder="Chevrolet NHR" value={form.brand} onChangeText={(brand) => onChange({ brand })} error={errors.brand} />
            <TextField label="Color" placeholder="Blanco" value={form.color} onChangeText={(color) => onChange({ color })} error={errors.color} />
            <View style={styles.row}>
                <View style={styles.flex}>
                    <TextField label="Placa" placeholder="ABC123" value={form.plate} onChangeText={(plate) => onChange({ plate })} error={errors.plate} autoCapitalize="characters" maxLength={7} />
                </View>
                <View style={styles.flex}>
                    <TextField label="Año del modelo" placeholder="2019" value={form.modelYear} onChangeText={(modelYear) => onChange({ modelYear })} error={errors.modelYear} keyboardType="number-pad" maxLength={4} />
                </View>
            </View>
            <SwitchRow label="Carrocería cerrada" hint="Furgón o carpa: la carga va protegida de la lluvia" value={form.isCovered} onChange={(isCovered) => onChange({ isCovered })} />

            <SwitchRow
                label="Es más grande de lo normal"
                hint={`${typicalCapacity} Actívalo si el tuyo carga más, así ves también las cargas que le caben.`}
                value={form.biggerThanUsual}
                onChange={(biggerThanUsual) => onChange({ biggerThanUsual })}
            />
            {form.biggerThanUsual &&
                <View style={styles.row}>
                    <View style={styles.flex}>
                        <TextField label="Carga hasta (kg)" placeholder="6000" value={form.capacityKg} onChangeText={(capacityKg) => onChange({ capacityKg })} error={errors.capacityKg} keyboardType="number-pad" maxLength={5} />
                    </View>
                    <View style={styles.flex}>
                        <TextField label="Espacio (m³)" placeholder="30" value={form.capacityM3} onChangeText={(capacityM3) => onChange({ capacityM3 })} error={errors.capacityM3} keyboardType="decimal-pad" maxLength={5} />
                    </View>
                </View>
            }
            {form.biggerThanUsual &&
                <Notice tone="info" message="Los clientes ven esta capacidad al comparar ofertas y la app te muestra las cargas que caben en ella. Escribe la real." />}

            <Button title="Guardar cambios" variant="dark" loading={saving} onPress={onSave} />
            <Button title="Cancelar" variant="text" disabled={saving} onPress={onCancel} />
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
