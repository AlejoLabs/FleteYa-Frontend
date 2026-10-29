import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { container } from "../../../../di/container";
import { DriverCarInfo } from "../../../../domain/models/DriverCarInfo";
import { DriverDocument } from "../../../../domain/models/DriverDocument";
import { Photo } from "../../../../domain/models/Photo";
import { useAuth } from "../../../hooks/useAuth";
import { AppText, Button, Card, ConfirmDialog, KeyboardArea, StateView, StatusPill, TextField, useToast } from "../../../components/ui";
import DocumentsStatus from "../../../components/DocumentsStatus";
import PhotoStrip from "../../../components/PhotoStrip";
import { choosePhoto } from "../../../utils/PhotoPicker";
import { formatErrorMessage } from "../../../utils/Formatters";
import { colors, fonts, radius, spacing } from "../../../theme";
import { CarForm, CarFormErrors, DriverCarInfoViewModel } from "./DriverCarInfoViewModel";

const MAX_VEHICLE_PHOTOS = 4;

// Mi vehículo: lo que ven los clientes al comparar ofertas y el estado de los documentos
export function DriverCarInfoScreen() {

    const viewModel: DriverCarInfoViewModel = container.resolve('driverCarInfoViewModel');
    const { authResponse } = useAuth();
    const { showToast } = useToast();
    const idDriver = authResponse?.user.id!;
    const [car, setCar] = useState<DriverCarInfo | null>(null);
    const [loadFailed, setLoadFailed] = useState(false);
    const [documents, setDocuments] = useState<DriverDocument[]>([]);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [form, setForm] = useState<CarForm | null>(null);
    const [errors, setErrors] = useState<CarFormErrors>({});
    const [saving, setSaving] = useState(false);
    const [photoToRemove, setPhotoToRemove] = useState<string | null>(null);

    const load = async () => {
        setLoadFailed(false);
        const [carResponse, documentsResponse, photosResponse] = await Promise.all([
            viewModel.getDriverCarInfo(idDriver),
            viewModel.getMyDocuments(),
            viewModel.getVehiclePhotos(idDriver),
        ]);
        if ('brand' in carResponse) setCar(carResponse);
        else setLoadFailed(true);
        if (Array.isArray(documentsResponse)) setDocuments(documentsResponse);
        if (Array.isArray(photosResponse)) setPhotos(photosResponse);
    }

    // El menú lateral deja la pantalla montada: se recarga cada vez que se vuelve a ella
    useFocusEffect(useCallback(() => {
        load();
    }, []));

    const handleAddPhoto = async () => {
        const result = await choosePhoto('Foto del vehículo');
        if (!result.ok) {
            if (!result.cancelled) showToast(result.message, 'error');
            return;
        }
        const response = await viewModel.uploadVehiclePhoto(result.uri);
        if ('statusCode' in response) {
            showToast(formatErrorMessage(response.message), 'error');
            return;
        }
        setPhotos((current) => [...current, response]);
    }

    const handleRemovePhoto = async () => {
        const key = photoToRemove;
        setPhotoToRemove(null);
        if (!key) return;
        const response = await viewModel.deleteVehiclePhoto(Number(key));
        if (response === true) {
            setPhotos((current) => current.filter((photo) => String(photo.id) !== key));
            showToast('Foto quitada', 'info');
        } else {
            showToast(formatErrorMessage((response as any).message), 'error');
        }
    }

    const handleSave = async () => {
        if (!form) return;
        const problems = viewModel.validate(form);
        setErrors(problems);
        if (Object.keys(problems).length > 0) return;
        setSaving(true);
        const response = await viewModel.saveCar(idDriver, form);
        setSaving(false);
        if ('brand' in response) {
            setCar((current) => current ? { ...current, ...response } : response);
            setForm(null);
            showToast('Datos del vehículo guardados', 'success');
        } else {
            showToast(formatErrorMessage(response.message), 'error');
        }
    }

    if (!car) {
        return (
            <View style={styles.screen}>
                {loadFailed
                    ? <StateView kind="error" message="No pudimos cargar tu vehículo." onAction={load} />
                    : <StateView kind="loading" message="Cargando tu vehículo…" />}
            </View>
        );
    }

    const capacity = viewModel.capacityText(car);

    return (
        <KeyboardArea style={styles.screen} aboveBottomInset>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <Card variant="elevated">
                    <View style={styles.carTop}>
                        <View style={styles.flex}>
                            <AppText variant="heading">{viewModel.vehicleTitle(car)}</AppText>
                            <AppText variant="small" color="textMuted">
                                {[car.color, car.is_covered ? 'carrocería cerrada' : 'carrocería abierta'].filter(Boolean).join(' · ')}
                            </AppText>
                        </View>
                        {car.license_category && <StatusPill label={`Licencia ${car.license_category}`} tone="neutral" />}
                    </View>
                    {/* Como la placa amarilla de los vehículos en Colombia */}
                    <View style={styles.plate} accessibilityLabel={`Placa ${car.plate.split('').join(' ')}`}>
                        <AppText style={styles.plateText}>{viewModel.plateText(car.plate)}</AppText>
                    </View>
                    {capacity && <AppText variant="small" color="textMuted">{capacity}</AppText>}

                    {form
                        ? <View style={styles.form}>
                            <TextField label="Marca y referencia" value={form.brand} onChangeText={(brand) => setForm({ ...form, brand })} error={errors.brand} />
                            <TextField label="Color" value={form.color} onChangeText={(color) => setForm({ ...form, color })} error={errors.color} />
                            <TextField label="Placa" value={form.plate} onChangeText={(plate) => setForm({ ...form, plate })} error={errors.plate} autoCapitalize="characters" maxLength={7} />
                            <Button title="Guardar cambios" variant="dark" loading={saving} onPress={handleSave} />
                            <Button title="Cancelar" variant="text" disabled={saving} onPress={() => { setForm(null); setErrors({}); }} />
                        </View>
                        : <Button title="Editar datos" icon="create-outline" variant="secondary" onPress={() => setForm({ brand: car.brand, color: car.color, plate: car.plate })} />
                    }
                </Card>

                <View style={styles.section}>
                    <AppText variant="label" color="textMuted">Fotos del vehículo</AppText>
                    <AppText variant="small" color="textMuted">Los clientes las ven al comparar ofertas. Toca la ✕ para quitar una.</AppText>
                    <PhotoStrip
                        items={photos.map((photo) => ({ key: String(photo.id), path: photo.url }))}
                        maxItems={MAX_VEHICLE_PHOTOS}
                        onAdd={handleAddPhoto}
                        onRemove={setPhotoToRemove}
                    />
                </View>

                <View style={styles.section}>
                    <AppText variant="label" color="textMuted">Documentos</AppText>
                    <Card style={styles.documents}>
                        {documents.length > 0
                            ? <DocumentsStatus documents={documents} />
                            // Conductores registrados antes de que la app pidiera los documentos
                            : <AppText variant="small" color="textMuted" style={styles.noDocuments}>No tienes fechas de vencimiento registradas.</AppText>}
                    </Card>
                </View>
            </ScrollView>

            <ConfirmDialog
                visible={photoToRemove !== null}
                title="Quitar foto"
                message="Los clientes ya no la verán al comparar ofertas."
                confirmLabel="Quitar foto"
                tone="danger"
                onConfirm={handleRemovePhoto}
                onCancel={() => setPhotoToRemove(null)}
            />
        </KeyboardArea>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.surfaceMuted,
    },
    content: {
        padding: spacing.lg,
        gap: spacing.xl,
    },
    flex: {
        flex: 1,
    },
    carTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
    },
    plate: {
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xs,
        borderRadius: radius.sm,
        borderWidth: 2,
        borderColor: colors.asphalt,
        backgroundColor: colors.cargo,
    },
    plateText: {
        fontFamily: fonts.displayHeavy,
        fontSize: 30,
        lineHeight: 36,
        letterSpacing: 2,
        color: colors.asphalt,
    },
    form: {
        gap: spacing.md,
    },
    section: {
        gap: spacing.sm,
    },
    documents: {
        paddingVertical: spacing.xs,
    },
    noDocuments: {
        paddingVertical: spacing.md,
    },
});
