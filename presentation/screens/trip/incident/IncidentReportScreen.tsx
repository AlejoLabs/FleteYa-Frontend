import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { container } from "../../../../di/container";
import { TripSharedParamList } from "../../../navigator/TripSharedParamList";
import { IncidentReport } from "../../../../domain/models/IncidentReport";
import {
    EMPTY_INCIDENT_FORM, INCIDENT_KINDS, INCIDENT_STATUS_LABELS, IncidentForm, IncidentReportViewModel,
    incidentKindLabel, MAX_DESCRIPTION_LENGTH, MAX_INCIDENT_PHOTOS
} from "./IncidentReportViewModel";
import { AppHeader, AppText, Button, Card, ChipGroup, KeyboardArea, TextField, useToast } from "../../../components/ui";
import PhotoStrip from "../../../components/PhotoStrip";
import { choosePhoto } from "../../../utils/PhotoPicker";
import { formatErrorMessage, formatTripDate } from "../../../utils/Formatters";
import { colors, spacing } from "../../../theme";

type Props = NativeStackScreenProps<TripSharedParamList, 'IncidentReportScreen'>;

// Reportar un problema del viaje (daño, pérdida, demora, mal trato) con fotos para el equipo de FleteYa
export function IncidentReportScreen({ navigation, route }: Props) {

    const { idClientRequest } = route.params;
    const viewModel: IncidentReportViewModel = container.resolve('incidentReportViewModel');
    const { showToast } = useToast();
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
            if (!result.cancelled) showToast(result.message, 'error');
            return;
        }
        setForm((current) => ({ ...current, photoUris: [...current.photoUris, result.uri] }));
    }

    const handleSubmit = async () => {
        if (isSending) return;
        const error = viewModel.validate(form);
        if (error) {
            showToast(error, 'error');
            return;
        }
        setIsSending(true);
        const response = await viewModel.createIncident(idClientRequest, form);
        setIsSending(false);
        if ('id' in response) {
            // El aviso queda arriba aunque la pantalla se cierre: el proveedor de avisos vive en la raíz de la app
            showToast('Recibimos tu reporte. El equipo de FleteYa lo va a revisar.', 'success');
            navigation.goBack();
        } else {
            showToast(formatErrorMessage(response.message), 'error');
        }
    }

    return (
        <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
            <AppHeader title="Reportar un problema" subtitle={`Flete #${idClientRequest}`} onBack={() => navigation.goBack()} />
            <KeyboardArea style={styles.flex} aboveBottomInset>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    {previous.length > 0 &&
                        <Card variant="muted" style={styles.previous}>
                            <AppText variant="smallStrong">Tus reportes de este viaje</AppText>
                            {previous.map((report) => (
                                <AppText key={report.id} variant="small" color="textMuted">
                                    {incidentKindLabel(report.kind)} · {INCIDENT_STATUS_LABELS[report.status]} · {formatTripDate(report.created_at)}
                                </AppText>
                            ))}
                        </Card>
                    }

                    <View style={styles.block}>
                        <AppText variant="label" color="textMuted">¿Qué pasó?</AppText>
                        <ChipGroup options={INCIDENT_KINDS} selected={form.kind} onSelect={(kind) => update({ kind })} />
                    </View>

                    <View style={styles.block}>
                        <TextField
                            label="Cuéntanos"
                            placeholder="Qué se dañó o faltó, en qué momento del viaje y cualquier dato que ayude"
                            value={form.description}
                            onChangeText={(description) => update({ description })}
                            maxLength={MAX_DESCRIPTION_LENGTH}
                            multiline
                            textAlignVertical="top"
                            style={styles.description}
                        />
                        <AppText variant="caption" color="textMuted" align="right">{form.description.length} / {MAX_DESCRIPTION_LENGTH}</AppText>
                    </View>

                    <View style={styles.block}>
                        <AppText variant="label" color="textMuted">Fotos · hasta {MAX_INCIDENT_PHOTOS}</AppText>
                        <PhotoStrip
                            items={form.photoUris.map((uri) => ({ key: uri, localUri: uri }))}
                            maxItems={MAX_INCIDENT_PHOTOS}
                            onAdd={handleAddPhoto}
                            onRemove={(key) => update({ photoUris: form.photoUris.filter((uri) => uri !== key) })}
                        />
                    </View>

                    <AppText variant="small" color="textMuted">Solo tú y el equipo de FleteYa ven este reporte.</AppText>
                </ScrollView>
                <View style={styles.footer}>
                    <Button title="Enviar reporte" variant="dark" loading={isSending} onPress={handleSubmit} />
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
        padding: spacing.lg,
        gap: spacing.xl,
    },
    previous: {
        gap: spacing.xs,
    },
    block: {
        gap: spacing.sm,
    },
    description: {
        minHeight: 120,
    },
    footer: {
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});
