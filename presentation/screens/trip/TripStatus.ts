import { LatLng } from "react-native-maps";
import { ClientRequestResponse, Position } from "../../../domain/models/ClientRequestResponse";
import { Status } from "../../../domain/repository/ClientRequestRepository";

// Reglas del viaje en curso que comparten el cliente y el conductor

// Mientras la carga no esté a bordo cualquiera de los dos puede cancelar
const CANCELABLE: string[] = [Status.ACCEPTED, Status.ON_THE_WAY, Status.ARRIVED];
export const canCancelTrip = (status: string) => CANCELABLE.includes(status);

// El backend guarda los puntos como POINT(lng lat): x es la longitud
export const toLatLng = (position: Position): LatLng => ({ latitude: position.y, longitude: position.x });

// Con la carga a bordo el vehículo va al destino; antes, al punto de recogida
export const isCargoOnBoard = (status: string) => status === Status.TRAVELING;
export const routeTarget = (request: ClientRequestResponse, status: string): LatLng =>
    toLatLng(isCargoOnBoard(status) ? request.destination_position : request.pickup_position);

// "llega cerca de las 11:09": la hora en que se cumplen los minutos estimados, con la hora del teléfono
export const arrivalTime = (minutes: number): string =>
    new Date(Date.now() + minutes * 60_000).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
