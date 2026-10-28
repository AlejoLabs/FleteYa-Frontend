import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useState } from "react";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../../navigator/MainStackNavigator";
import { container } from "../../../../di/container";
import { useAuth } from "../../../hooks/useAuth";
import FormField, { formStyles, parseDayMonthYear } from "../../../components/FormField";
import ChipGroup from "../../../components/ChipGroup";
import DefaultRoundedButton from "../../../components/DefaultRoundedButton";
import { VehicleType } from "../../../../domain/models/ClientRequest";
import { VEHICLES } from "../../../utils/Cargo";
import { formatErrorMessage } from "../../../utils/Formatters";

interface Props extends StackScreenProps<RootStackParamList, 'DriverVehicleRegisterScreen'> { };

const LICENSE_CATEGORIES = ['B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
// Igual que el backend: B1/C1 sirven hasta furgón liviano (tipo NHR); el camión pide B2/C2 o superior
const HEAVY_CATEGORIES = ['B2', 'B3', 'C2', 'C3'];
const PLATE_REGEX = /^[A-Z]{3}\d{3}$/;

// Segundo paso del registro "Quiero transportar": el vehículo de carga y sus documentos
export default function DriverVehicleRegisterScreen({ navigation, route }: Props) {

    const { account } = route.params;
    const viewModel = container.resolve('registerViewModel');
    const { saveAuthSession } = useAuth();

    const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
    const [brand, setBrand] = useState('');
    const [color, setColor] = useState('');
    const [plate, setPlate] = useState('');
    const [modelYear, setModelYear] = useState('');
    const [isCovered, setIsCovered] = useState(false);
    const [licenseNumber, setLicenseNumber] = useState('');
    const [licenseCategory, setLicenseCategory] = useState<string | null>(null);
    const [licenseExpires, setLicenseExpires] = useState('');
    const [soatExpires, setSoatExpires] = useState('');
    const [technoExpires, setTechnoExpires] = useState('');
    const [propertyCard, setPropertyCard] = useState('');
    const [isSending, setIsSending] = useState(false);

    const isHeavy = vehicleType === 'CAMION';
    const normalizedPlate = plate.toUpperCase().replace(/[\s-]/g, '');

    const handleRegister = async () => {
        const licenseDate = parseDayMonthYear(licenseExpires);
        const soatDate = parseDayMonthYear(soatExpires);
        const technoDate = technoExpires.trim() ? parseDayMonthYear(technoExpires) : undefined;
        const problems = [
            !vehicleType && 'Elige el tipo de vehículo',
            (brand.trim().length < 2 || color.trim().length < 2) && 'Escribe la marca y el color',
            !PLATE_REGEX.test(normalizedPlate) && 'La placa debe tener 3 letras y 3 números, por ejemplo ABC123',
            !/^\d{4}$/.test(modelYear.trim()) && 'Escribe el año del modelo, por ejemplo 2019',
            licenseNumber.trim().length < 5 && 'Escribe el número de tu licencia',
            !licenseCategory && 'Elige la categoría de tu licencia',
            licenseCategory && isHeavy && !HEAVY_CATEGORIES.includes(licenseCategory) && 'Para camión necesitas licencia B2 o C2 en adelante',
            !licenseDate && 'La fecha de vencimiento de la licencia debe ser DD/MM/AAAA',
            !soatDate && 'La fecha de vencimiento del SOAT debe ser DD/MM/AAAA',
            technoDate === null && 'La fecha de la revisión técnico-mecánica debe ser DD/MM/AAAA',
            propertyCard.trim().length < 5 && 'Escribe el número de la tarjeta de propiedad',
        ].filter(Boolean) as string[];
        if (problems.length > 0) {
            Alert.alert('Revisa los datos', problems.join('\n'));
            return;
        }

        setIsSending(true);
        const response = await viewModel.registerDriver(account, {
            vehicle_type: vehicleType!,
            brand: brand.trim(),
            color: color.trim(),
            plate: normalizedPlate,
            model_year: Number(modelYear),
            is_covered: isCovered,
            license_number: licenseNumber.trim(),
            license_category: licenseCategory!,
            license_expires_at: licenseDate!,
            soat_expires_at: soatDate!,
            techno_expires_at: technoDate ?? undefined,
            property_card_number: propertyCard.trim(),
        });
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
                    selected={vehicleType}
                    onSelect={setVehicleType}
                />

                <FormField label="Marca y referencia" value={brand} onChangeText={setBrand} placeholder="Chevrolet NHR" />
                <FormField label="Color" value={color} onChangeText={setColor} placeholder="Blanco" />
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <FormField label="Placa" value={plate} onChangeText={setPlate} autoCapitalize="characters" maxLength={7} placeholder="ABC123" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <FormField label="Año del modelo" value={modelYear} onChangeText={setModelYear} keyboardType="number-pad" maxLength={4} placeholder="2019" />
                    </View>
                </View>
                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Carrocería cerrada (furgón o carpa)</Text>
                    <Switch value={isCovered} onValueChange={setIsCovered} />
                </View>

                <Text style={formStyles.section}>Licencia de conducción</Text>
                <FormField label="Número de la licencia" value={licenseNumber} onChangeText={setLicenseNumber} keyboardType="number-pad" />
                <Text style={styles.label}>Categoría</Text>
                <ChipGroup
                    options={LICENSE_CATEGORIES.map((c) => ({ value: c, label: c, disabled: isHeavy && !HEAVY_CATEGORIES.includes(c) }))}
                    selected={licenseCategory}
                    onSelect={setLicenseCategory}
                />
                <FormField label="Vence el" value={licenseExpires} onChangeText={setLicenseExpires} keyboardType="numbers-and-punctuation" placeholder="DD/MM/AAAA" />

                <Text style={formStyles.section}>Documentos del vehículo</Text>
                <FormField label="SOAT vence el" value={soatExpires} onChangeText={setSoatExpires} keyboardType="numbers-and-punctuation" placeholder="DD/MM/AAAA" />
                <FormField
                    label="Revisión técnico-mecánica vence el"
                    value={technoExpires}
                    onChangeText={setTechnoExpires}
                    keyboardType="numbers-and-punctuation"
                    placeholder="DD/MM/AAAA"
                    hint="Déjalo vacío si el vehículo es nuevo y todavía no la necesita."
                />
                <FormField label="Número de la tarjeta de propiedad" value={propertyCard} onChangeText={setPropertyCard} />

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
