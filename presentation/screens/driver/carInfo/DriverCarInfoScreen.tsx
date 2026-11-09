import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { container } from "../../../../di/container";
import { DriverCarInfo } from "../../../../domain/models/DriverCarInfo";
import { DriverDocument } from "../../../../domain/models/DriverDocument";
import { Photo } from "../../../../domain/models/Photo";
import { useAuth } from "../../../hooks/useAuth";
import { AppText, Button, Card, ConfirmDialog, KeyboardArea, StateView, StatusPill, useToast } from "../../../components/ui";
import DocumentsStatus from "../../../components/DocumentsStatus";
import PhotoStrip from "../../../components/PhotoStrip";
import { choosePhoto } from "../../../utils/PhotoPicker";
import { formatErrorMessage } from "../../../utils/Formatters";
import { colors, fonts, radius, spacing } from "../../../theme";
import { DocumentsForm, DocumentsFormErrors, DriverCarInfoViewModel, VehicleForm, VehicleFormErrors } from "./DriverCarInfoViewModel";
import VehicleEditForm from "./components/VehicleEditForm";
import DocumentsEditForm from "./components/DocumentsEditForm";
import { useTranslation } from 'react-i18next';
import { t } from '../../../../i18n';

const MAX_VEHICLE_PHOTOS = 4;

// Mi vehículo: lo que ven los clientes al comparar ofertas y el estado de los documentos
export function DriverCarInfoScreen() {
    const { t } = useTranslation();

    const viewModel: DriverCarInfoViewModel = container.resolve('driverCarInfoViewModel');
    const { authResponse } = useAuth();
    const { showToast } = useToast();
    const idDriver = authResponse?.user.id!;
    const [car, setCar] = useState<DriverCarInfo | null>(null);
    const [loadFailed, setLoadFailed] = useState(false);
    const [documents, setDocuments] = useState<DriverDocument[]>([]);
    const [photos, setPhotos] = useState<Photo[]>([]);
    // Solo uno de los dos formularios está abierto a la vez
    const [vehicleForm, setVehicleForm] = useState<VehicleForm | null>(null);
    const [vehicleErrors, setVehicleErrors] = useState<VehicleFormErrors>({});
    const [documentsForm, setDocumentsForm] = useState<DocumentsForm | null>(null);
    const [documentsErrors, setDocumentsErrors] = useState<DocumentsFormErrors>({});
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
        const result = await choosePhoto(t('driverCarInfo.fotoDelVehiculo'));
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
            showToast(t('driverCarInfo.fotoQuitada'), 'info');
        } else {
            showToast(formatErrorMessage((response as any).message), 'error');
        }
    }

    const editVehicle = (current: DriverCarInfo) => {
        setDocumentsForm(null);
        setVehicleErrors({});
        setVehicleForm(viewModel.vehicleFormFrom(current));
    }

    const editDocuments = (current: DriverCarInfo) => {
        setVehicleForm(null);
        setDocumentsErrors({});
        setDocumentsForm(viewModel.documentsFormFrom(current));
    }

    // Cambiar un campo quita su error: el aviso solo vuelve si se intenta guardar otra vez
    const updateVehicleForm = (changes: Partial<VehicleForm>) => {
        setVehicleForm((current) => current && { ...current, ...changes });
        setVehicleErrors((current) => {
            const next = { ...current };
            (Object.keys(changes) as (keyof VehicleForm)[]).forEach((field) => delete next[field]);
            return next;
        });
    }

    const updateDocumentsForm = (changes: Partial<DocumentsForm>) => {
        setDocumentsForm((current) => current && { ...current, ...changes });
        setDocumentsErrors((current) => {
            const next = { ...current };
            (Object.keys(changes) as (keyof DocumentsForm)[]).forEach((field) => delete next[field]);
            return next;
        });
    }

    const handleSaveVehicle = async () => {
        if (!vehicleForm || !car) return;
        const problems = viewModel.validateVehicle(vehicleForm, car.license_category);
        setVehicleErrors(problems);
        if (Object.keys(problems).length > 0) return;
        setSaving(true);
        const response = await viewModel.saveVehicle(vehicleForm);
        setSaving(false);
        if ('brand' in response) {
            setCar((current) => current ? { ...current, ...response } : response);
            setVehicleForm(null);
            showToast(t('driverCarInfo.datosDelVehiculoGuardados'), 'success');
        } else {
            showToast(formatErrorMessage(response.message), 'error');
        }
    }

    const handleSaveDocuments = async () => {
        if (!documentsForm || !car) return;
        const problems = viewModel.validateDocuments(documentsForm, car.vehicle_type);
        setDocumentsErrors(problems);
        if (Object.keys(problems).length > 0) return;
        setSaving(true);
        const response = await viewModel.saveDocuments(documentsForm);
        setSaving(false);
        if (Array.isArray(response)) {
            setDocuments(response);
            setDocumentsForm(null);
            showToast(t('driverCarInfo.documentosActualizados'), 'success');
            // Trae la categoría y las fechas guardadas para la próxima edición
            const updated = await viewModel.getDriverCarInfo(idDriver);
            if ('brand' in updated) setCar(updated);
        } else {
            showToast(formatErrorMessage(response.message), 'error');
        }
    }

    if (!car) {
        return (
            <View style={styles.screen}>
                {loadFailed
                    ? <StateView kind="error" message={t('driverCarInfo.noPudimosCargarTuVehiculo')} onAction={load} />
                    : <StateView kind="loading" message={t('driverCarInfo.cargandoTuVehiculo')} />}
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
                                {[car.color, car.is_covered ? t('driverCarInfo.carroceriaCerrada') : t('driverCarInfo.carroceriaAbierta')].filter(Boolean).join(' · ')}
                            </AppText>
                        </View>
                        {car.license_category && <StatusPill label={t('driverCarInfo.licencia', { license_category: car.license_category })} tone="neutral" />}
                    </View>
                    {/* Como la placa amarilla de los vehículos en Colombia */}
                    <View style={styles.plate} accessibilityLabel={t('driverCarInfo.placa', { split: car.plate.split('').join(' ') })}>
                        <AppText style={styles.plateText}>{viewModel.plateText(car.plate)}</AppText>
                    </View>
                    {capacity && <AppText variant="small" color="textMuted">{capacity}</AppText>}

                    {vehicleForm
                        ? <VehicleEditForm
                            form={vehicleForm}
                            errors={vehicleErrors}
                            typicalCapacity={viewModel.typicalCapacityText(vehicleForm.vehicleType)}
                            saving={saving}
                            onChange={updateVehicleForm}
                            onSave={handleSaveVehicle}
                            onCancel={() => setVehicleForm(null)}
                        />
                        : <Button title={t('driverCarInfo.cambiarVehiculoOCapacidad')} icon="create-outline" variant="secondary" onPress={() => editVehicle(car)} />
                    }
                </Card>

                <View style={styles.section}>
                    <AppText variant="label" color="textMuted">{t('driverCarInfo.fotosDelVehiculo')}</AppText>
                    <AppText variant="small" color="textMuted">{t('driverCarInfo.losClientesLasVenAl')}</AppText>
                    <PhotoStrip
                        items={photos.map((photo) => ({ key: String(photo.id), path: photo.url }))}
                        maxItems={MAX_VEHICLE_PHOTOS}
                        onAdd={handleAddPhoto}
                        onRemove={setPhotoToRemove}
                    />
                </View>

                <View style={styles.section}>
                    <AppText variant="label" color="textMuted">{t('driverCarInfo.documentos')}</AppText>
                    <Card style={styles.documents}>
                        {documentsForm
                            ? <View style={styles.documentsForm}>
                                <DocumentsEditForm
                                    form={documentsForm}
                                    errors={documentsErrors}
                                    isHeavy={car.vehicle_type === 'CAMION'}
                                    saving={saving}
                                    onChange={updateDocumentsForm}
                                    onSave={handleSaveDocuments}
                                    onCancel={() => setDocumentsForm(null)}
                                />
                            </View>
                            : <>
                                {documents.length > 0
                                    ? <DocumentsStatus documents={documents} />
                                    // Conductores registrados antes de que la app pidiera los documentos
                                    : <AppText variant="small" color="textMuted" style={styles.noDocuments}>{t('driverCarInfo.noTienesFechasDeVencimiento')}</AppText>}
                                <Button title={t('driverCarInfo.actualizarDocumentos')} icon="refresh-outline" variant="secondary" onPress={() => editDocuments(car)} style={styles.documentsButton} />
                            </>
                        }
                    </Card>
                </View>
            </ScrollView>

            <ConfirmDialog
                visible={photoToRemove !== null}
                title={t('driverCarInfo.quitarFoto')}
                message={t('driverCarInfo.losClientesYaNoLa')}
                confirmLabel={t('driverCarInfo.quitarFoto')}
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
    section: {
        gap: spacing.sm,
    },
    documents: {
        paddingVertical: spacing.xs,
    },
    noDocuments: {
        paddingVertical: spacing.md,
    },
    documentsForm: {
        paddingVertical: spacing.md,
    },
    documentsButton: {
        marginBottom: spacing.md,
    },
});
