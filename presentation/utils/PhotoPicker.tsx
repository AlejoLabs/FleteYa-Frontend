import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export type PhotoSource = 'camera' | 'library';

export type PhotoPickResult =
    | { ok: true; uri: string }
    | { ok: false; cancelled: boolean; message: string };

// Ancho suficiente para ver bien la carga; con compresión JPEG la foto queda en unos 200-400 KB en vez de varios MB
const MAX_WIDTH = 1280;
const JPEG_QUALITY = 0.6;

// Abre la cámara o la galería y devuelve la foto ya reducida y comprimida, lista para subir
export const pickPhoto = async (source: PhotoSource): Promise<PhotoPickResult> => {
    const permission = source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
        return { ok: false, cancelled: false, message: source === 'camera' ? 'Activa el permiso de la cámara para tomar la foto' : 'Activa el permiso de fotos para elegir una' };
    }

    const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 1 };
    const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
    if (result.canceled || !result.assets?.length) {
        return { ok: false, cancelled: true, message: '' };
    }

    try {
        const asset = result.assets[0];
        const resize = asset.width > MAX_WIDTH ? [{ resize: { width: MAX_WIDTH } }] : [];
        const compressed = await manipulateAsync(asset.uri, resize, { compress: JPEG_QUALITY, format: SaveFormat.JPEG });
        return { ok: true, uri: compressed.uri };
    } catch (error) {
        console.log('No se pudo comprimir la foto', error);
        return { ok: false, cancelled: false, message: 'No se pudo preparar la foto, intenta con otra' };
    }
}

// Pregunta si usar la cámara o la galería y luego toma la foto (cancelled: true si la persona se arrepiente)
export const choosePhoto = (title = 'Agregar foto'): Promise<PhotoPickResult> => new Promise((resolve) => {
    const cancelled: PhotoPickResult = { ok: false, cancelled: true, message: '' };
    Alert.alert(title, '¿De dónde quieres sacar la foto?', [
        { text: 'Cámara', onPress: () => pickPhoto('camera').then(resolve) },
        { text: 'Galería', onPress: () => pickPhoto('library').then(resolve) },
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(cancelled) },
    ], { cancelable: true, onDismiss: () => resolve(cancelled) });
});
