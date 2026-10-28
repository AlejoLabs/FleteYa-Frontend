import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { CargoCategory, VehicleType } from "../../../../domain/models/ClientRequest";
import ChipGroup from "../../../components/ChipGroup";
import DefaultRoundedButton from "../../../components/DefaultRoundedButton";
import { CARGO_CATEGORIES, VEHICLES, vehicleLabel, vehicleRank } from "../../../utils/Cargo";

export interface CargoDetails {
    category: CargoCategory;
    packages: number;
    isFragile: boolean;
    needsCover: boolean;
    vehicleType: VehicleType | null;
    helpers: number;
    pickupFloor: number;
    pickupElevator: boolean;
    destinationFloor: number;
    destinationElevator: boolean;
    otherSender: boolean;
    senderName: string;
    senderPhone: string;
    otherReceiver: boolean;
    receiverName: string;
    receiverPhone: string;
    // null = "Ahora"
    scheduledAt: Date | null;
    noProhibitedItems: boolean;
}

export const DEFAULT_CARGO_DETAILS: CargoDetails = {
    category: 'OTRO',
    packages: 1,
    isFragile: false,
    needsCover: false,
    vehicleType: null,
    helpers: 0,
    pickupFloor: 1,
    pickupElevator: false,
    destinationFloor: 1,
    destinationElevator: false,
    otherSender: false,
    senderName: '',
    senderPhone: '',
    otherReceiver: false,
    receiverName: '',
    receiverPhone: '',
    scheduledAt: null,
    noProhibitedItems: false,
};

// Los fletes programados van de 1 hora a 30 días adelante; la app ofrece los próximos 7 días entre 6 a. m. y 8 p. m.
const SCHEDULE_DAYS = 7;
const SCHEDULE_HOURS = Array.from({ length: 15 }, (_, i) => i + 6);
const MIN_AHEAD_MS = 60 * 60 * 1000;

const dayStart = (offset: number) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    return date;
}

const dayLabel = (offset: number) => {
    if (offset === 0) return 'Hoy';
    if (offset === 1) return 'Mañana';
    return dayStart(offset).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' });
}

const scheduleDate = (dayOffset: number, hour: number) => {
    const date = dayStart(dayOffset);
    date.setHours(hour);
    return date;
}

interface Props {
    visible: boolean;
    value: CargoDetails;
    suggestedVehicle: VehicleType | null;
    onChange: (changes: Partial<CargoDetails>) => void;
    onClose: () => void;
}

function Stepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (value: number) => void }) {
    return (
        <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepperButton} onPress={() => onChange(Math.max(min, value - 1))}>
                <Text style={styles.stepperText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{value}</Text>
            <TouchableOpacity style={styles.stepperButton} onPress={() => onChange(Math.min(max, value + 1))}>
                <Text style={styles.stepperText}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

function SwitchRow({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
    return (
        <View style={styles.rowBetween}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Switch value={value} onValueChange={onChange} />
        </View>
    );
}

export default function CargoDetailsModal({ visible, value, suggestedVehicle, onChange, onClose }: Props) {
    const scheduledDay = value.scheduledAt
        ? Math.round((new Date(value.scheduledAt).setHours(0, 0, 0, 0) - dayStart(0).getTime()) / 86400000)
        : null;
    const scheduledHour = value.scheduledAt ? new Date(value.scheduledAt).getHours() : null;
    const isTooSoon = (dayOffset: number, hour: number) => scheduleDate(dayOffset, hour).getTime() < Date.now() + MIN_AHEAD_MS;

    const selectDay = (dayOffset: number) => {
        const firstHour = SCHEDULE_HOURS.find((hour) => !isTooSoon(dayOffset, hour));
        const hour = scheduledHour !== null && !isTooSoon(dayOffset, scheduledHour) ? scheduledHour : firstHour;
        if (hour !== undefined) onChange({ scheduledAt: scheduleDate(dayOffset, hour) });
    }

    const firstDayWithHours = Array.from({ length: SCHEDULE_DAYS }, (_, i) => i).find((day) => SCHEDULE_HOURS.some((hour) => !isTooSoon(day, hour))) ?? 1;

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            {/* El fondo para cerrar va al lado del contenido y no envolviéndolo: un Pressable alrededor no deja desplazar el ScrollView */}
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Detalles del flete</Text>
                    </View>
                    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">

                        <Text style={styles.section}>¿Cuándo?</Text>
                        <ChipGroup
                            options={[{ value: 'NOW', label: 'Ahora' }, { value: 'LATER', label: 'Programar' }]}
                            selected={value.scheduledAt ? 'LATER' : 'NOW'}
                            onSelect={(option) => option === 'NOW' ? onChange({ scheduledAt: null }) : selectDay(scheduledDay ?? firstDayWithHours)}
                        />
                        {value.scheduledAt &&
                            <>
                                <ChipGroup
                                    options={Array.from({ length: SCHEDULE_DAYS }, (_, day) => ({
                                        value: day,
                                        label: dayLabel(day),
                                        disabled: SCHEDULE_HOURS.every((hour) => isTooSoon(day, hour)),
                                    }))}
                                    selected={scheduledDay}
                                    onSelect={selectDay}
                                />
                                <ChipGroup
                                    options={SCHEDULE_HOURS.map((hour) => ({
                                        value: hour,
                                        label: scheduleDate(0, hour).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' }),
                                        disabled: isTooSoon(scheduledDay ?? 0, hour),
                                    }))}
                                    selected={scheduledHour}
                                    onSelect={(hour) => onChange({ scheduledAt: scheduleDate(scheduledDay ?? 0, hour) })}
                                />
                                <Text style={styles.hint}>Los conductores pueden ofertar hasta 30 minutos antes.</Text>
                            </>
                        }

                        <Text style={styles.section}>Tipo de carga</Text>
                        <ChipGroup options={CARGO_CATEGORIES} selected={value.category} onSelect={(category) => onChange({ category })} />

                        <View style={styles.rowBetween}>
                            <Text style={styles.rowLabel}>Número de bultos</Text>
                            <Stepper value={value.packages} min={1} max={500} onChange={(packages) => onChange({ packages })} />
                        </View>
                        <SwitchRow label="Es frágil" value={value.isFragile} onChange={(isFragile) => onChange({ isFragile })} />
                        <SwitchRow label="Debe ir cubierta (lluvia, polvo)" value={value.needsCover} onChange={(needsCover) => onChange({ needsCover })} />

                        <Text style={styles.section}>Vehículo</Text>
                        <Text style={styles.hint}>
                            {suggestedVehicle
                                ? `Por el peso y las medidas sugerimos: ${vehicleLabel(suggestedVehicle)}. Puedes pedir uno más grande.`
                                : 'Completa peso y medidas para sugerirte un vehículo.'}
                        </Text>
                        <ChipGroup
                            options={VEHICLES.map((vehicle) => ({
                                value: vehicle.type,
                                label: vehicle.label,
                                disabled: suggestedVehicle !== null && vehicleRank(vehicle.type) < vehicleRank(suggestedVehicle),
                            }))}
                            selected={value.vehicleType ?? suggestedVehicle}
                            onSelect={(vehicleType) => onChange({ vehicleType })}
                        />

                        <Text style={styles.section}>Cargue y descargue</Text>
                        <View style={styles.rowBetween}>
                            <Text style={styles.rowLabel}>Ayudantes</Text>
                            <Stepper value={value.helpers} min={0} max={6} onChange={(helpers) => onChange({ helpers })} />
                        </View>
                        <View style={styles.rowBetween}>
                            <Text style={styles.rowLabel}>Piso en el origen</Text>
                            <Stepper value={value.pickupFloor} min={1} max={60} onChange={(pickupFloor) => onChange({ pickupFloor })} />
                        </View>
                        {value.pickupFloor > 1 &&
                            <SwitchRow label="Hay ascensor en el origen" value={value.pickupElevator} onChange={(pickupElevator) => onChange({ pickupElevator })} />}
                        <View style={styles.rowBetween}>
                            <Text style={styles.rowLabel}>Piso en el destino</Text>
                            <Stepper value={value.destinationFloor} min={1} max={60} onChange={(destinationFloor) => onChange({ destinationFloor })} />
                        </View>
                        {value.destinationFloor > 1 &&
                            <SwitchRow label="Hay ascensor en el destino" value={value.destinationElevator} onChange={(destinationElevator) => onChange({ destinationElevator })} />}

                        <Text style={styles.section}>Contactos</Text>
                        <SwitchRow label="Otra persona entrega la carga" value={value.otherSender} onChange={(otherSender) => onChange({ otherSender })} />
                        {value.otherSender &&
                            <View style={styles.contactRow}>
                                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Nombre" placeholderTextColor="#888" value={value.senderName} onChangeText={(senderName) => onChange({ senderName })} />
                                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Celular" placeholderTextColor="#888" keyboardType="phone-pad" maxLength={10} value={value.senderPhone} onChangeText={(senderPhone) => onChange({ senderPhone })} />
                            </View>}
                        <SwitchRow label="Otra persona recibe la carga" value={value.otherReceiver} onChange={(otherReceiver) => onChange({ otherReceiver })} />
                        {value.otherReceiver &&
                            <View style={styles.contactRow}>
                                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Nombre" placeholderTextColor="#888" value={value.receiverName} onChangeText={(receiverName) => onChange({ receiverName })} />
                                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Celular" placeholderTextColor="#888" keyboardType="phone-pad" maxLength={10} value={value.receiverPhone} onChangeText={(receiverPhone) => onChange({ receiverPhone })} />
                            </View>}

                        <TouchableOpacity style={styles.checkRow} onPress={() => onChange({ noProhibitedItems: !value.noProhibitedItems })}>
                            <View style={[styles.checkbox, value.noProhibitedItems && styles.checkboxChecked]}>
                                {value.noProhibitedItems && <Text style={styles.checkMark}>✓</Text>}
                            </View>
                            <Text style={styles.checkText}>Confirmo que la carga no es material peligroso (inflamable, explosivo, químico) ni animales.</Text>
                        </TouchableOpacity>

                        <DefaultRoundedButton text="Listo" backgroundColor="black" onPress={onClose} marginBottom={10} />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        height: '90%',
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    header: {
        backgroundColor: 'black',
        height: 50,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        justifyContent: 'center',
        paddingLeft: 20,
    },
    headerText: {
        color: 'white',
    },
    body: {
        padding: 16,
        paddingBottom: 30,
    },
    section: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 14,
        marginBottom: 8,
    },
    hint: {
        color: 'gray',
        fontSize: 13,
        marginBottom: 8,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 44,
    },
    rowLabel: {
        fontSize: 15,
        flex: 1,
    },
    stepper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepperButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#eee',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepperText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    stepperValue: {
        width: 40,
        textAlign: 'center',
        fontSize: 16,
    },
    contactRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: '#f7f7f7',
    },
    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        backgroundColor: '#fff6e0',
        borderRadius: 10,
        padding: 10,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#555',
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: 'black',
        borderColor: 'black',
    },
    checkMark: {
        color: 'white',
        fontWeight: 'bold',
    },
    checkText: {
        flex: 1,
        fontSize: 13,
    },
});
