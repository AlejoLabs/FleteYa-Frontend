import { StyleSheet, Text, View } from "react-native";

const STEPS = [
    { label: 'Aceptado', statuses: ['ACCEPTED', 'ON_THE_WAY'] },
    { label: 'En el origen', statuses: ['ARRIVED'] },
    { label: 'Carga recogida', statuses: ['TRAVELING'] },
    { label: 'Entregado', statuses: ['FINISHED'] },
];

// Barra de progreso del viaje que ven el cliente y el conductor
export default function TripProgress({ status }: { status: string }) {
    const current = STEPS.findIndex((step) => step.statuses.includes(status));
    return (
        <View style={styles.row}>
            {STEPS.map((step, index) => {
                const done = index <= current;
                return (
                    <View key={step.label} style={styles.step}>
                        <View style={[styles.bar, done && styles.barDone]} />
                        <Text style={[styles.label, done && styles.labelDone]}>{step.label}</Text>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: 8,
    },
    step: {
        flex: 1,
    },
    bar: {
        height: 5,
        borderRadius: 3,
        backgroundColor: '#ddd',
    },
    barDone: {
        backgroundColor: 'green',
    },
    label: {
        fontSize: 11,
        color: '#999',
        marginTop: 3,
        textAlign: 'center',
    },
    labelDone: {
        color: '#222',
        fontWeight: 'bold',
    },
});
