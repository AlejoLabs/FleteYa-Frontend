import { useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { readPushData } from "../utils/PushNotifications";

type Role = 'CLIENT' | 'DRIVER';

// Pantalla que abre cada notificación según el modo en que está la persona. null = solo abrir la app
const targetFor = (role: Role, type?: string, idClientRequest?: number): [string, object] | null => {
    if (role === 'CLIENT') {
        if (type === 'NEW_OFFER' && idClientRequest) {
            return ['ClientMapStackNavigator', { screen: 'ClientSearchMapScreen', params: { idClientRequest } }];
        }
        if (['DRIVER_ARRIVED', 'CARGO_PICKED_UP', 'DELIVERED'].includes(type ?? '') && idClientRequest) {
            // idDriver 0: la pantalla del viaje toma el conductor asignado del propio viaje
            return ['ClientMapStackNavigator', { screen: 'ClientTripMapScreen', params: { idClientRequest, idDriver: 0 } }];
        }
    } else {
        if (type === 'DRIVER_ASSIGNED' && idClientRequest) {
            return ['DriverMapStackNavigator', { screen: 'DriverTripMapScreen', params: { idClientRequest } }];
        }
        if (type === 'DOCUMENTS_EXPIRING') return ['DriverCarInfoScreen', {}];
    }
    if (type === 'CHAT_MESSAGE' && idClientRequest) {
        const stack = role === 'CLIENT' ? 'ClientMapStackNavigator' : 'DriverMapStackNavigator';
        return [stack, { screen: 'TripChatScreen', params: { idClientRequest } }];
    }
    if (type === 'SCHEDULED_REMINDER') return ['UpcomingTripsScreen', {}];
    return null;
}

// Inicio de cada rol en la pila principal; las pantallas de destino viven dentro de su menú lateral
const HOME_ROUTE: Record<Role, string> = { CLIENT: 'ClientHomeScreen', DRIVER: 'DriverHomeScreen' };

// Al tocar una notificación (con la app abierta, en segundo plano o cerrada) abre la pantalla del viaje.
// Se usa en el menú lateral de cada rol: así solo navega cuando la persona ya entró en ese modo
export const useNotificationNavigation = (role: Role) => {
    const navigation = useNavigation<any>();
    const response = Notifications.useLastNotificationResponse();
    const handledId = useRef<string | null>(null);

    useEffect(() => {
        if (!response) return;
        const id = response.notification.request.identifier;
        if (handledId.current === id) return;
        handledId.current = id;

        const data = readPushData(response);
        const target = targetFor(role, data.type, data.id_client_request ? Number(data.id_client_request) : undefined);
        if (target) navigation.navigate(HOME_ROUTE[role], { screen: target[0], params: target[1] });
        // Para que al volver a abrir la app no repita la navegación
        Notifications.clearLastNotificationResponse();
    }, [response]);
}
