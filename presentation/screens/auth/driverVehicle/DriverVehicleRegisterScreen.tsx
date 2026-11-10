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
import { formatErrorMessage, formatNumber } from '../../../utils/Formatters';
import { colors, spacing } from "../../../theme";
import { DriverVehicleErrors, DriverVehicleForm, DriverVehicleRegisterViewModel, EMPTY_DRIVER_VEHICLE_FORM, MAX_VEHICLE_PHOTOS, isHeavyVehicle } from "./DriverVehicleRegisterViewModel";
import { useTranslation } from 'react-i18next';
import { t } from '../../../../i18n';
import { allowsTruck, documentLabels, vehicleRules } from "../../../utils/VehicleRules";

interface Props extends StackScreenProps<RootStackParamList, 'DriverVehicleRegisterScreen'> { };

// Segundo paso del registro "Quiero transportar": el vehículo de carga y sus documentos
export default function DriverVehicleRegisterScreen({ navigation, route }: Props) {
    const { t } = useTranslation();

    const { account } = route.params;
    // Placa, licencia y documentos según el país de la cuenta (Colombia: ABC123, B1 a C3, SOAT y técnico-mecánica)
    const rules = vehicleRules(account.country_code);
    const labels = documentLabels(account.country_code, {
        soat: t('driverVehicleRegister.elSoatVenceEl'),
        techno: t('driverVehicleRegister.laRevisionTecnicoMecanicaVence'),
        propertyCard: t('driverVehicleRegister.numeroDeLaTarjetaDe'),
    });
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
        const result = await choosePhoto(t('driverVehicleRegister.fotoDelVehiculo'));
        if (result.ok) update({ photos: [...form.photos, result.uri] });
        else if (!result.cancelled) showToast(result.message, 'error');
    }

    const handleRegister = async () => {
        const problems = viewModel.validate(form, account.country_code);
        setErrors(problems);
        if (Object.keys(problems).length > 0) {
            showToast(t('driverVehicleRegister.revisaLosDatosMarcadosEn'), 'error');
            return;
        }
        setIsSending(true);
        const response = await viewModel.registerDriver(account, form);
        setIsSending(false);
        if ('token' in response) {
            // El login ya decide a dónde ir según el rol: un conductor nuevo entra directo a su inicio
            showToast(t('driverVehicleRegister.cuentaCreadaHola', { name: account.name }), 'success');
            navigation.popToTop();
            saveAuthSession(response);
            return;
        }
        showToast(formatErrorMessage(response.message), 'error');
    }

    return (
        <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
            <AppHeader
                title={t('driverVehicleRegister.tuVehiculoDeCarga')}
                onBack={() => navigation.goBack()}
                right={<AppText variant="caption" color="textMuted">{t('driverVehicleRegister.paso2De2')}</AppText>}
            />
            <KeyboardArea aboveBottomInset style={styles.flex}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <AppText variant="body" color="textMuted">{t('driverVehicleRegister.holaConEstosDatosTe', { name: account.name })}</AppText>

                    <View style={styles.block}>
                        <AppText variant="label" color="textMuted">{t('driverVehicleRegister.tipoDeVehiculo')}</AppText>
                        <View style={styles.options} accessibilityRole="radiogroup">
                            {VEHICLES.map((vehicle) => (
                                <OptionCard
                                    key={vehicle.type}
                                    title={t(vehicle.label)}
                                    description={t('driverVehicleRegister.hastaKg', { maxWeightKg: formatNumber(vehicle.maxWeightKg) })}
                                    selected={form.vehicleType === vehicle.type}
                                    onPress={() => update({ vehicleType: vehicle.type })}
                                />
                            ))}
                        </View>
                        {errors.vehicleType && <AppText variant="caption" color="danger">{errors.vehicleType}</AppText>}
                    </View>

                    <TextField label={t('driverVehicleRegister.marcaYReferencia')} placeholder={t('driverVehicleRegister.chevroletNhr')} value={form.brand} onChangeText={(brand) => update({ brand })} error={errors.brand} />
                    <TextField label={t('driverVehicleRegister.color')} placeholder={t('driverVehicleRegister.blanco')} value={form.color} onChangeText={(color) => update({ color })} error={errors.color} />
                    <View style={styles.row}>
                        <View style={styles.flex}>
                            <TextField label={t('driverVehicleRegister.placa')} placeholder={rules.platePlaceholder} value={form.plate} onChangeText={(plate) => update({ plate })} error={errors.plate} autoCapitalize="characters" maxLength={rules.plateMaxLength} />
                        </View>
                        <View style={styles.flex}>
                            <TextField label={t('driverVehicleRegister.anoDelModelo')} placeholder="2019" value={form.modelYear} onChangeText={(modelYear) => update({ modelYear })} error={errors.modelYear} keyboardType="number-pad" maxLength={4} />
                        </View>
                    </View>
                    <SwitchRow label={t('driverVehicleRegister.carroceriaCerrada')} hint={t('driverVehicleRegister.furgonOCarpaLaCarga')} value={form.isCovered} onChange={(isCovered) => update({ isCovered })} />

                    <AppText variant="label" color="textMuted">{t('driverVehicleRegister.licenciaDeConduccion')}</AppText>
                    <TextField label={t('driverVehicleRegister.numeroDeLaLicencia')} value={form.licenseNumber} onChangeText={(licenseNumber) => update({ licenseNumber })} error={errors.licenseNumber} keyboardType="number-pad" />
                    <View style={styles.block}>
                        <AppText variant="smallStrong">{t('driverVehicleRegister.categoria')}</AppText>
                        <ChipGroup
                            options={rules.licenseCategories.map((category) => ({ value: category, label: category, disabled: isHeavy && !allowsTruck(category, account.country_code) }))}
                            selected={form.licenseCategory}
                            onSelect={(licenseCategory) => update({ licenseCategory })}
                        />
                        {errors.licenseCategory
                            ? <AppText variant="caption" color="danger">{errors.licenseCategory}</AppText>
                            : isHeavy && rules.isColombia && <AppText variant="caption" color="textMuted">{t('driverVehicleRegister.paraCamionNecesitasB2O')}</AppText>}
                    </View>
                    <TextField label={t('driverVehicleRegister.laLicenciaVenceEl')} placeholder="DD/MM/AAAA" value={form.licenseExpires} onChangeText={(licenseExpires) => update({ licenseExpires })} error={errors.licenseExpires} keyboardType="numbers-and-punctuation" />

                    <AppText variant="label" color="textMuted">{t('driverVehicleRegister.documentosDelVehiculo')}</AppText>
                    <TextField label={labels.soat} placeholder="DD/MM/AAAA" value={form.soatExpires} onChangeText={(soatExpires) => update({ soatExpires })} error={errors.soatExpires} keyboardType="numbers-and-punctuation" />
                    <TextField
                        label={labels.techno}
                        placeholder="DD/MM/AAAA"
                        hint={t('driverVehicleRegister.dejaloVacioSiElVehiculo')}
                        value={form.technoExpires}
                        onChangeText={(technoExpires) => update({ technoExpires })}
                        error={errors.technoExpires}
                        keyboardType="numbers-and-punctuation"
                    />
                    <TextField label={labels.propertyCard} value={form.propertyCard} onChangeText={(propertyCard) => update({ propertyCard })} error={errors.propertyCard} />

                    <View style={styles.block}>
                        <AppText variant="label" color="textMuted">{t('driverVehicleRegister.fotosDelVehiculo')}</AppText>
                        <AppText variant="small" color="textMuted">{t('driverVehicleRegister.alMenosUnaDondeSe')}</AppText>
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
                    <Button title={t('driverVehicleRegister.crearMiCuentaDeConductor')} loading={isSending} onPress={handleRegister} />
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
