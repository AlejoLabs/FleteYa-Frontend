import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../../navigator/MainStackNavigator";
import { container } from "../../../../di/container";
import { useAuth } from "../../../hooks/useAuth";
import { AppHeader, AppText, Button, ChipGroup, KeyboardArea, OptionCard, SwitchRow, TextField, useToast } from "../../../components/ui";
import PhotoStrip from "../../../components/PhotoStrip";
import { choosePhoto } from "../../../utils/PhotoPicker";
import { VEHICLES } from "../../../utils/Cargo";
import { formatErrorMessage } from "../../../utils/Formatters";
import { colors, spacing } from "../../../theme";
import { DriverVehicleErrors, DriverVehicleForm, DriverVehicleRegisterViewModel, EMPTY_DRIVER_VEHICLE_FORM, HEAVY_CATEGORIES, LICENSE_CATEGORIES, MAX_VEHICLE_PHOTOS, isHeavyVehicle } from "./DriverVehicleRegisterViewModel";

interface Props extends StackScreenProps<RootStackParamList, 'DriverVehicleRegisterScreen'> { };

// Segundo paso del registro "Quiero transportar": el vehículo de carga y sus documentos
export default function DriverVehicleRegisterScreen({ navigation, route }: Props) {

    const { account } = route.params;
    const viewModel: DriverVehicleRegisterViewModel = container.resolve('driverVehicleRegisterViewModel');
    const { saveAuthSession } = useAuth();
    const { showToast } = useToast();
    const [form, setForm] = useState<DriverVehicleForm>(EMPTY_DRIVER_VEHICLE_FORM);
    const [errors, setErrors] = useState<DriverVehicleErrors>({});
    const [isSending, setIsSending] = useState(false);
    const isHeavy = isHeavyVehicle(form.vehicleType);

    // Al corregir un campo su error se borra; los demás siguen a la vista
    const update = (changes: Partial<DriverVehicleForm>) => {
        setForm((current) => ({ ...current, ...changes }));
        setErrors((current) => {
            const next = { ...current };
            (Object.keys(changes) as (keyof DriverVehicleForm)[]).forEach((key) => delete next[key]);
            return next;
        });
    }

    const addPhoto = async () => {
        const result = await choosePhoto('Foto del vehículo');
        if (result.ok) update({ photos: [...form.photos, result.uri] });
        else if (!result.cancelled) showToast(result.message, 'error');
    }

    const handleRegister = async () => {
        const problems = viewModel.validate(form);
        setErrors(problems);
        if (Object.keys(problems).length > 0) {
            showToast('Revisa los datos marcados en rojo', 'error');
            return;
        }
        setIsSending(true);
        const response = await viewModel.registerDriver(account, form);
        setIsSending(false);
        if ('token' in response) {
            // El login ya decide a dónde ir según el rol: un conductor nuevo entra directo a su inicio
            showToast(`Cuenta creada. ¡Hola, ${account.name}!`, 'success');
            navigation.popToTop();
            saveAuthSession(response);
            return;
        }
        showToast(formatErrorMessage(response.message), 'error');
    }

    return (
        <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
            <AppHeader
                title="Tu vehículo de carga"
                onBack={() => navigation.goBack()}
                right={<AppText variant="caption" color="textMuted">Paso 2 de 2</AppText>}
            />
            <KeyboardArea aboveBottomInset style={styles.flex}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <AppText variant="body" color="textMuted">
                        Hola {account.name}. Con estos datos te mostramos solo las cargas que caben en tu vehículo.
                    </AppText>

                    <View style={styles.block}>
                        <AppText variant="label" color="textMuted">Tipo de vehículo</AppText>
                        <View style={styles.options} accessibilityRole="radiogroup">
                            {VEHICLES.map((vehicle) => (
                                <OptionCard
                                    key={vehicle.type}
                                    title={vehicle.label}
                                    description={`Hasta ${vehicle.maxWeightKg.toLocaleString('es-CO')} kg`}
                                    selected={form.vehicleType === vehicle.type}
                                    onPress={() => update({ vehicleType: vehicle.type })}
                                />
                            ))}
                        </View>
                        {errors.vehicleType && <AppText variant="caption" color="danger">{errors.vehicleType}</AppText>}
                    </View>

                    <TextField label="Marca y referencia" placeholder="Chevrolet NHR" value={form.brand} onChangeText={(brand) => update({ brand })} error={errors.brand} />
                    <TextField label="Color" placeholder="Blanco" value={form.color} onChangeText={(color) => update({ color })} error={errors.color} />
                    <View style={styles.row}>
                        <View style={styles.flex}>
                            <TextField label="Placa" placeholder="ABC123" value={form.plate} onChangeText={(plate) => update({ plate })} error={errors.plate} autoCapitalize="characters" maxLength={7} />
                        </View>
                        <View style={styles.flex}>
                            <TextField label="Año del modelo" placeholder="2019" value={form.modelYear} onChangeText={(modelYear) => update({ modelYear })} error={errors.modelYear} keyboardType="number-pad" maxLength={4} />
                        </View>
                    </View>
                    <SwitchRow label="Carrocería cerrada" hint="Furgón o carpa: la carga va protegida de la lluvia" value={form.isCovered} onChange={(isCovered) => update({ isCovered })} />

                    <AppText variant="label" color="textMuted">Licencia de conducción</AppText>
                    <TextField label="Número de la licencia" value={form.licenseNumber} onChangeText={(licenseNumber) => update({ licenseNumber })} error={errors.licenseNumber} keyboardType="number-pad" />
                    <View style={styles.block}>
                        <AppText variant="smallStrong">Categoría</AppText>
                        <ChipGroup
                            options={LICENSE_CATEGORIES.map((category) => ({ value: category, label: category, disabled: isHeavy && !HEAVY_CATEGORIES.includes(category) }))}
                            selected={form.licenseCategory}
                            onSelect={(licenseCategory) => update({ licenseCategory })}
                        />
                        {errors.licenseCategory
                            ? <AppText variant="caption" color="danger">{errors.licenseCategory}</AppText>
                            : isHeavy && <AppText variant="caption" color="textMuted">Para camión necesitas B2 o C2 en adelante.</AppText>}
                    </View>
                    <TextField label="La licencia vence el" placeholder="DD/MM/AAAA" value={form.licenseExpires} onChangeText={(licenseExpires) => update({ licenseExpires })} error={errors.licenseExpires} keyboardType="numbers-and-punctuation" />

                    <AppText variant="label" color="textMuted">Documentos del vehículo</AppText>
                    <TextField label="El SOAT vence el" placeholder="DD/MM/AAAA" value={form.soatExpires} onChangeText={(soatExpires) => update({ soatExpires })} error={errors.soatExpires} keyboardType="numbers-and-punctuation" />
                    <TextField
                        label="La revisión técnico-mecánica vence el"
                        placeholder="DD/MM/AAAA"
                        hint="Déjalo vacío si el vehículo es nuevo y todavía no la necesita."
                        value={form.technoExpires}
                        onChangeText={(technoExpires) => update({ technoExpires })}
                        error={errors.technoExpires}
                        keyboardType="numbers-and-punctuation"
                    />
                    <TextField label="Número de la tarjeta de propiedad" value={form.propertyCard} onChangeText={(propertyCard) => update({ propertyCard })} error={errors.propertyCard} />

                    <View style={styles.block}>
                        <AppText variant="label" color="textMuted">Fotos del vehículo</AppText>
                        <AppText variant="small" color="textMuted">Al menos una donde se vea la placa. Los clientes las ven al comparar ofertas.</AppText>
                        <PhotoStrip
                            items={form.photos.map((uri) => ({ key: uri, localUri: uri }))}
                            maxItems={MAX_VEHICLE_PHOTOS}
                            onAdd={addPhoto}
                            onRemove={(uri) => update({ photos: form.photos.filter((photo) => photo !== uri) })}
                        />
                        {errors.photos && <AppText variant="caption" color="danger">{errors.photos}</AppText>}
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <Button title="Crear mi cuenta de conductor" loading={isSending} onPress={handleRegister} />
                </View>
            </KeyboardArea>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    flex: {
        flex: 1,
    },
    content: {
        gap: spacing.lg,
        padding: spacing.lg,
    },
    block: {
        gap: spacing.sm,
    },
    options: {
        gap: spacing.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
    },
    // El botón queda abajo y visible aunque el formulario se desplace
    footer: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
    },
});
