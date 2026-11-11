import { AppState } from "react-native";
import { Socket } from "socket.io-client";
import io from "socket.io-client";
import { BASE_URL } from "../api/ApiRequestHandler";
import { LocalStorage } from "../../local/LocalStorage";
import { AuthResponse } from "../../../../domain/models/AuthResponse";

export class SocketService {

    private socket: Socket;
    // Hay una sesión usando el socket: después de un corte se vuelve a conectar. Se apaga al cerrar sesión
    private wanted = false;

    constructor(socket: Socket) {
        this.socket = io(BASE_URL,{
            transports: ['websocket'],
            // Sin límite de intentos: con 5, un corte de más de ~20 s dejaba congelado el mapa del cliente hasta
            // reabrir la pantalla (lo encontró la prueba de reconexión). La espera entre intentos sube hasta 5 s
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            // No se conecta al abrir la app: antes del login no hay token y el servidor rechazaría la conexión
            autoConnect: false,
            // Se lee en cada intento de conexión, así toma el token de quien tenga la sesión abierta en ese momento
            auth: (cb) => {
                new LocalStorage().getItem('auth').then((data) => {
                    const authResponse: AuthResponse | null = data ? JSON.parse(data) : null;
                    cb({ token: authResponse?.token ?? '' });
                });
            },
        });

        // Al volver la app al frente: el sistema pudo cortar la conexión mientras estaba en segundo plano
        AppState.addEventListener('change', (state) => {
            if (state === 'active' && this.wanted && !this.socket.connected) {
                this.socket.connect();
            }
        });
    }

    getSocket(){
        return this.socket;
    }

    // El socket es compartido por todas las pantallas; si nadie lo está conectando, se conecta al usarlo.
    // `active` cubre también el "conectando", para no mandar dos conexiones a la vez
    private ensureConnected() {
        this.wanted = true;
        if (!this.socket.active) {
            this.socket.connect();
        }
    }

    connect() {
        this.ensureConnected();
    }

    sendMessage(event: string, message: any) {
        this.ensureConnected();
        this.socket.emit(event, message);
    }

    // Devuelve la función para quitar el listener; la pantalla debe llamarla al desmontarse
    onMessage(event: string, callback: (...args: any[]) => void): () => void {
        this.ensureConnected();
        this.socket.on(event, callback);
        return () => {
            this.socket.off(event, callback);
        };
    }

    // La conexión volvió después de un corte: los avisos de ese rato (cambio de estado, fotos) no llegaron
    onReconnect(callback: () => void): () => void {
        this.socket.io.on('reconnect', callback);
        return () => {
            this.socket.io.off('reconnect', callback);
        };
    }

    // Se llama al cerrar sesión: la conexión quedó autenticada con el usuario que sale
    disconnect() {
        this.wanted = false;
        this.socket.disconnect();
    }

}
