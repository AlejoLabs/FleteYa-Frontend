import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Chat que la persona tiene abierto: sus mensajes ya se ven en pantalla, no hace falta el aviso
let openChatTrip: number | null = null;
export const setOpenChat = (idClientRequest: number | null) => {
    openChatTrip = idClientRequest;
}

// Con la app abierta también se muestra el aviso: la persona puede estar en otra pantalla (perfil, historial)
Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
        const data = readNotificationData(notification);
        // Con la app abierta, la solicitud nueva ya sale como tarjeta en el inicio del conductor
        const show = data.type !== 'NEW_REQUEST' && !(data.type === 'CHAT_MESSAGE' && Number(data.id_client_request) === openChatTrip);
        return { shouldShowBanner: show, shouldShowList: show, shouldPlaySound: show, shouldSetBadge: false };
    },
});

// Mismo id que usa el backend en android.notification.channelId
const TRIPS_CHANNEL = 'trips';

// Pide permiso y devuelve el token de Firebase de este teléfono, o null si no hay permiso o Firebase no está configurado
export const getPushToken = async (): Promise<string | null> => {
    try {
        if (Platform.OS === 'android') {
            // Sin "sound": así usa el sonido del sistema (un nombre ahí se busca como archivo de sonido propio)
            await Notifications.setNotificationChannelAsync(TRIPS_CHANNEL, {
                name: 'Fletes',
                importance: Notifications.AndroidImportance.HIGH,
            });
        }
        let { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
            status = (await Notifications.requestPermissionsAsync()).status;
        }
        if (status !== 'granted') return null;
        const token = await Notifications.getDevicePushTokenAsync();
        return typeof token.data === 'string' ? token.data : null;
    } catch (error) {
        console.log('No se pudieron activar las notificaciones', error);
        return null;
    }
}

export type PushData = { type?: string; id_client_request?: string };

// El backend manda type e id_client_request como datos de la notificación
function readNotificationData(notification: Notifications.Notification): PushData {
    const content = notification.request.content;
    const trigger: any = notification.request.trigger;
    return { ...(trigger?.remoteMessage?.data ?? {}), ...(content.data ?? {}) } as PushData;
}

export const readPushData = (response: Notifications.NotificationResponse): PushData => readNotificationData(response.notification);
