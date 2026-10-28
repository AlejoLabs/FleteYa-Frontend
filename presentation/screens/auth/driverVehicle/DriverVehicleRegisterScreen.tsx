import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useState } from "react";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../../navigator/MainStackNavigator";
import { container } from "../../../../di/container";
import { useAuth } from "../../../hooks/useAuth";
import FormField, { formStyles } from "../../../components/FormField";
import ChipGroup from "../../../components/ChipGroup";
import DefaultRoundedButton from "../../../components/DefaultRoundedButton";
import { VEHICLES } from "../../../utils/Cargo";
import { formatErrorMessage } from "../../../utils/Formatters";
import { DriverVehicleForm, EMPTY_DRIVER_VEHICLE_FORM, HEAVY_CATEGORIES, LICENSE_CATEGORIES, isHeavyVehicle } from "./DriverVehicleRegisterViewModel";

interface Props extends StackScreenProps<RootStackParamList, 'DriverVehicleRegisterScreen'> { };

// Segundo paso del registro "Quiero transportar": el vehículo de carga y sus documentos
export default function DriverVehicleRegisterScreen({ navigation, route }: Props) {

    const { account } = route.params;
    const viewModel = container.resolve('driverVehicleRegisterViewModel');
    const { saveAuthSession } = useAuth();
    const [form, setForm] = useState<DriverVehicleForm>(EMPTY_DRIVER_VEHICLE_FORM);
    const [isSending, setIsSending] = useState(false);

    const update = (changes: Partial<DriverVehicleForm>) => setForm((current) => ({ ...current, ...changes }));
    const isHeavy = isHeavyVehicle(form.vehicleType);

    const handleRegister = async () => {
        const problems = viewModel.validate(form);
        if (problems.length > 0) {
            Alert.alert('Revisa los datos', problems.join('\n'));
            return;
        }

        setIsSending(true);
        const response = await viewModel.registerDriver(account, form);
        setIsSending(false);

        if ('token' in response) {
            // El login ya decide a dónde ir según el rol: un conductor nuevo entra directo a su inicio
            navigation.popToTop();
            saveAuthSession(response);
            return;
        }
        Alert.alert('No se pudo registrar', formatErrorMessage(response.message));
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={formStyles.screen} keyboardShouldPersistTaps="handled">
                <Text style={formStyles.title}>Tu vehículo de carga</Text>
                <Text style={formStyles.subtitle}>
                    Hola {account.name}. Con estos datos te mostramos solo las cargas que caben en tu vehículo.
                </Text>

                <Text style={formStyles.section}>Tipo de vehículo</Text>
                <ChipGroup
                    options={VEHICLES.map((v) => ({ value: v.type, label: `${v.label} (hasta ${v.maxWeightKg.toLocaleString('es-CO')} kg)` }))}
                    selected={form.vehicleType}
                    onSelect={(vehicleType) => update({ vehicleType })}
                />

                <FormField label="Marca y referencia" value={form.brand} onChangeText={(brand) => update({ brand })} placeholder="Chevrolet NHR" />
                <FormField label="Color" value={form.color} onChangeText={(color) => update({ color })} placeholder="Blanco" />
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <FormField label="Placa" value={form.plate} onChangeText={(plate) => update({ plate })} autoCapitalize="characters" maxLength={7} placeholder="ABC123" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <FormField label="Año del modelo" value={form.modelYear} onChangeText={(modelYear) => update({ modelYear })} keyboardType="number-pad" maxLength={4} placeholder="2019" />
                    </View>
                </View>
                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Carrocería cerrada (furgón o carpa)</Text>
                    <Switch value={form.isCovered} onValueChange={(isCovered) => update({ isCovered })} />
                </View>

                <Text style={formStyles.section}>Licencia de conducción</Text>
                <FormField label="Número de la licencia" value={form.licenseNumber} onChangeText={(licenseNumber) => update({ licenseNumber })} keyboardType="number-pad" />
                <Text style={styles.label}>Categoría</Text>
                <ChipGroup
                    options={LICENSE_CATEGORIES.map((c) => ({ value: c, label: c, disabled: isHeavy && !HEAVY_CATEGORIES.includes(c) }))}
                    selected={form.licenseCategory}
                    onSelect={(licenseCategory) => update({ licenseCategory })}
                />
                <FormField label="Vence el" value={form.licenseExpires} onChangeText={(licenseExpires) => update({ licenseExpires })} keyboardType="numbers-and-punctuation" placeholder="DD/MM/AAAA" />

                <Text style={formStyles.section}>Documentos del vehículo</Text>
                <FormField label="SOAT vence el" value={form.soatExpires} onChangeText={(soatExpires) => update({ soatExpires })} keyboardType="numbers-and-punctuation" placeholder="DD/MM/AAAA" />
                <FormField
                    label="Revisión técnico-mecánica vence el"
                    value={form.technoExpires}
                    onChangeText={(technoExpires) => update({ technoExpires })}
                    keyboardType="numbers-and-punctuation"
                    placeholder="DD/MM/AAAA"
                    hint="Déjalo vacío si el vehículo es nuevo y todavía no la necesita."
                />
                <FormField label="Número de la tarjeta de propiedad" value={form.propertyCard} onChangeText={(propertyCard) => update({ propertyCard })} />

                <DefaultRoundedButton
                    text={isSending ? 'Registrando...' : 'Crear mi cuenta de conductor'}
                    backgroundColor="black"
                    onPress={() => { if (!isSending) handleRegister(); }}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    switchLabel: {
        fontSize: 15,
        flex: 1,
    },
    label: {
        fontSize: 14,
        color: '#333',
        marginBottom: 6,
    },
});
