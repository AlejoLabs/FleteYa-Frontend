import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { t } from '../../i18n';

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
        return { ok: false, cancelled: false, message: source === 'camera' ? t('photoPicker.activaElPermisoDeLa') : t('photoPicker.activaElPermisoDeFotos') };
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
        return { ok: false, cancelled: false, message: t('photoPicker.noSePudoPrepararLa') };
    }
}

// La hoja de cámara o galería (PhotoSourceSheet) se registra aquí al montarse en App
type PhotoSourcePresenter = (title: string) => Promise<PhotoSource | null>;
let presentPhotoSource: PhotoSourcePresenter | null = null;

export const setPhotoSourcePresenter = (presenter: PhotoSourcePresenter | null) => {
    presentPhotoSource = presenter;
};

// Pregunta si usar la cámara o la galería y luego toma la foto (cancelled: true si la persona se arrepiente)
export const choosePhoto = async (title = t('photoPicker.agregarFoto')): Promise<PhotoPickResult> => {
    const source = presentPhotoSource ? await presentPhotoSource(title) : 'library';
    if (!source) return { ok: false, cancelled: true, message: '' };
    return pickPhoto(source);
};
