import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { container } from "../../../../di/container";
import { TripSharedParamList } from "../../../navigator/TripSharedParamList";
import { IncidentReport } from "../../../../domain/models/IncidentReport";
import {
    EMPTY_INCIDENT_FORM, INCIDENT_KINDS, INCIDENT_STATUS_LABELS, IncidentForm, IncidentReportViewModel,
    incidentKindLabel, MAX_DESCRIPTION_LENGTH, MAX_INCIDENT_PHOTOS
} from "./IncidentReportViewModel";
import ScreenHeader from "../../../components/ScreenHeader";
import PhotoStrip from "../../../components/PhotoStrip";
import { choosePhoto } from "../../../utils/PhotoPicker";
import { formatErrorMessage, formatTripDate } from "../../../utils/Formatters";

type Props = NativeStackScreenProps<TripSharedParamList, 'IncidentReportScreen'>;

export function IncidentReportScreen({ navigation, route }: Props) {

    const { idClientRequest } = route.params;
    const viewModel: IncidentReportViewModel = container.resolve('incidentReportViewModel');
    const insets = useSafeAreaInsets();
    const [form, setForm] = useState<IncidentForm>(EMPTY_INCIDENT_FORM);
    const [previous, setPrevious] = useState<IncidentReport[]>([]);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        viewModel.getMyIncidents(idClientRequest).then((response) => {
            if (Array.isArray(response)) setPrevious(response);
        });
    }, []);

    const update = (changes: Partial<IncidentForm>) => setForm((current) => ({ ...current, ...changes }));

    const handleAddPhoto = async () => {
        const result = await choosePhoto('Foto del problema');
        if (!result.ok) {
            if (!result.cancelled) Alert.alert('Foto', result.message);
            return;
        }
        setForm((current) => ({ ...current, photoUris: [...current.photoUris, result.uri] }));
    }

    const handleSubmit = async () => {
        if (isSending) return;
        const error = viewModel.validate(form);
        if (error) {
            ToastAndroid.show(error, ToastAndroid.LONG);
            return;
        }
        setIsSending(true);
        const response = await viewModel.createIncident(idClientRequest, form);
        setIsSending(false);
        if ('id' in response) {
            Alert.alert('Recibimos tu reporte', 'El equipo de FleteYa lo va a revisar y te contactará si necesita más datos.', [
                { text: 'Entendido', onPress: () => navigation.goBack() },
            ]);
        } else {
            ToastAndroid.show(formatErrorMessage(response.message), ToastAndroid.LONG);
        }
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            <ScreenHeader title="Reportar un problema" onBack={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">

                {previous.length > 0 &&
                    <View style={styles.previous}>
                        <Text style={styles.label}>Tus reportes de este viaje</Text>
                        {previous.map((report) => (
                            <Text key={report.id} style={styles.previousItem}>
                                {incidentKindLabel(report.kind)} · {INCIDENT_STATUS_LABELS[report.status]} · {formatTripDate(report.created_at)}
                            </Text>
                        ))}
                    </View>
                }

                <Text style={styles.label}>¿Qué pasó?</Text>
                <View style={styles.chips}>
                    {INCIDENT_KINDS.map((kind) => {
                        const selected = form.kind === kind.value;
                        return (
                            <TouchableOpacity key={kind.value} style={[styles.chip, selected && styles.chipSelected]} onPress={() => update({ kind: kind.value })}>
                                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{kind.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Text style={styles.label}>Cuéntanos los detalles</Text>
                <TextInput
                    style={styles.description}
                    placeholder="Qué se dañó o faltó, en qué momento del viaje y cualquier dato que ayude"
                    placeholderTextColor="#888"
                    value={form.description}
                    onChangeText={(description) => update({ description })}
                    maxLength={MAX_DESCRIPTION_LENGTH}
                    multiline
                    textAlignVertical="top"
                />
                <Text style={styles.counter}>{form.description.length}/{MAX_DESCRIPTION_LENGTH}</Text>

                <Text style={styles.label}>Fotos (opcional)</Text>
                <PhotoStrip
                    items={form.photoUris.map((uri) => ({ key: uri, localUri: uri }))}
                    maxItems={MAX_INCIDENT_PHOTOS}
                    onAdd={handleAddPhoto}
                    onRemove={(key) => update({ photoUris: form.photoUris.filter((uri) => uri !== key) })}
                />

                <TouchableOpacity style={[styles.submit, isSending && styles.submitDisabled]} onPress={handleSubmit} disabled={isSending}>
                    {isSending ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>Enviar reporte</Text>}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    content: {
        padding: 20,
        gap: 8,
    },
    previous: {
        backgroundColor: '#fff6e0',
        borderRadius: 12,
        padding: 12,
        gap: 4,
        marginBottom: 8,
    },
    previousItem: {
        color: '#444',
    },
    label: {
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 8,
    },
    chips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        borderWidth: 1,
        borderColor: '#bbb',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    chipSelected: {
        backgroundColor: 'black',
        borderColor: 'black',
    },
    chipText: {
        color: 'black',
    },
    chipTextSelected: {
        color: 'white',
        fontWeight: 'bold',
    },
    description: {
        minHeight: 120,
        borderWidth: 1,
        borderColor: '#bbb',
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        color: 'black',
    },
    counter: {
        alignSelf: 'flex-end',
        color: '#888',
        fontSize: 12,
    },
    submit: {
        marginTop: 20,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'red',
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitDisabled: {
        opacity: 0.6,
    },
    submitText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
