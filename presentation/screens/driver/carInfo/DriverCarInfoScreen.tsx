import { View, Text, Image, TouchableOpacity, Alert, ToastAndroid, ScrollView } from "react-native";
import styles from "./Styles";
import { use, useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import DefaultTextInput from "../../../components/DefaultTextInput";
import { Ionicons } from "@expo/vector-icons";
import { DriverCarInfoViewModel } from "./DriverCarInfoViewModel";
import { container } from "../../../../di/container";
import { DriverDocument } from "../../../../domain/models/DriverDocument";
import { Photo } from "../../../../domain/models/Photo";
import DocumentsStatus from "../../../components/DocumentsStatus";
import PhotoStrip from "../../../components/PhotoStrip";
import { choosePhoto } from "../../../utils/PhotoPicker";
import { formatErrorMessage } from "../../../utils/Formatters";

const MAX_VEHICLE_PHOTOS = 4;

export function DriverCarInfoScreen() {

    const viewModel: DriverCarInfoViewModel = container.resolve('driverCarInfoViewModel');
    const [brand, setBrand] = useState('');
    const [plate, setPlate] = useState('');
    const [color, setColor] = useState('');
    const { authResponse, removeAuthSession, saveAuthSession } = useAuth();
    const [documents, setDocuments] = useState<DriverDocument[]>([]);
    const [photos, setPhotos] = useState<Photo[]>([]);

    useEffect(() => {
        handleGetDriverCarInfo();
        loadDocumentsAndPhotos();
    }, []);

    const loadDocumentsAndPhotos = async () => {
        const [documentsResponse, photosResponse] = await Promise.all([
            viewModel.getMyDocuments(),
            viewModel.getVehiclePhotos(authResponse?.user.id!),
        ]);
        if (Array.isArray(documentsResponse)) setDocuments(documentsResponse);
        if (Array.isArray(photosResponse)) setPhotos(photosResponse);
    }

    const handleAddPhoto = async () => {
        const result = await choosePhoto('Foto del vehículo');
        if (!result.ok) {
            if (!result.cancelled) Alert.alert('Foto', result.message);
            return;
        }
        const response = await viewModel.uploadVehiclePhoto(result.uri);
        if ('statusCode' in response) {
            ToastAndroid.show(formatErrorMessage(response.message), ToastAndroid.LONG);
            return;
        }
        setPhotos((current) => [...current, response]);
    }

    const handleRemovePhoto = (key: string) => {
        Alert.alert('Quitar foto', '¿Quieres quitar esta foto de tu vehículo?', [
            { text: 'No', style: 'cancel' },
            {
                text: 'Quitar', style: 'destructive', onPress: async () => {
                    const response = await viewModel.deleteVehiclePhoto(Number(key));
                    if (response === true) {
                        setPhotos((current) => current.filter((photo) => String(photo.id) !== key));
                    } else {
                        ToastAndroid.show(formatErrorMessage((response as any).message), ToastAndroid.LONG);
                    }
                }
            },
        ]);
    }

    const handleCreateCarInfo = async () => {
        const response = await viewModel.createDriverCarInfo({
            id_driver: authResponse?.user.id!,
            brand: brand,
            plate: plate,
            color: color
        });
        if ('brand' in response) {
            ToastAndroid.show('Información del vehículo actualizada', ToastAndroid.LONG);
        }
        else{
            ToastAndroid.show(response.message.toString(), ToastAndroid.LONG);
        }
    }

    const handleGetDriverCarInfo = async () => {
        const response = await viewModel.getDriverCarInfo(authResponse?.user.id!);
        if ('brand' in response) {
            setBrand(response.brand);
            setPlate(response.plate);
            setColor(response.color);
        }
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
            <View style={styles.boxBackground}>
                <Text style={styles.textBox}>ACTUALIZAR DATOS DE VEHICULO</Text>
            </View>
            <View style={styles.cardUserInfo}>
                <TouchableOpacity onPress={() => { }}>
                    <Image
                        style={styles.imageUser}
                        source={require('../../../../assets/suv.png')}
                    />
                </TouchableOpacity>


                <View style={{ marginLeft: 20, marginRight: 30 }}>
                    <DefaultTextInput
                        placeholder="Marca del Vehiculo"
                        value={brand}
                        onChangeText={setBrand}
                        icon={require('../../../../assets/car.png')}
                        placeholderTextColor="black"
                        textColor="black"
                        borderBottomColor="black"
                    />
                </View>
                <View style={{ marginLeft: 20, marginRight: 30 }}>
                    <DefaultTextInput
                        placeholder="Placa del Vehiculo"
                        value={plate}
                        onChangeText={setPlate}
                        icon={require('../../../../assets/categories.png')}
                        placeholderTextColor="black"
                        textColor="black"
                        borderBottomColor="black"
                    />
                </View>
                <View style={{ marginLeft: 20, marginRight: 30 }}>
                    <DefaultTextInput
                        placeholder="Color"
                        value={color}
                        onChangeText={setColor}
                        icon={require('../../../../assets/comprobado.png')}
                        placeholderTextColor="black"
                        textColor="black"
                        borderBottomColor="black"
                    />
                </View>




            </View>
            <View style={styles.viewActions}>
                <TouchableOpacity style={styles.iconContainer} onPress={() => {
                    handleCreateCarInfo();
                }}>
                    <View style={styles.iconBox}>
                        <Ionicons name='pencil' size={25} color='white' />
                    </View>
                    <Text style={styles.textAction}>EDITAR VEHICULO</Text>
                </TouchableOpacity>
            </View>

            <View style={{ marginHorizontal: 25, gap: 8 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Mis documentos</Text>
                {documents.length > 0
                    ? <DocumentsStatus documents={documents} />
                    // Conductores registrados antes de que la app pidiera los documentos
                    : <Text style={{ color: '#555' }}>No tienes fechas de vencimiento registradas.</Text>}
                <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 12 }}>Fotos del vehículo</Text>
                <Text style={{ color: '#555' }}>Los clientes las ven al comparar ofertas. Toca la ✕ para quitar una.</Text>
                <PhotoStrip
                    items={photos.map((photo) => ({ key: String(photo.id), path: photo.url }))}
                    maxItems={MAX_VEHICLE_PHOTOS}
                    onAdd={handleAddPhoto}
                    onRemove={handleRemovePhoto}
                />
            </View>
        </ScrollView>
    )
}