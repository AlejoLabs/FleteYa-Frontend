import { Socket } from "socket.io-client";
import io from "socket.io-client";
import { BASE_URL } from "../api/ApiRequestHandler";
import { LocalStorage } from "../../local/LocalStorage";
import { AuthResponse } from "../../../../domain/models/AuthResponse";

export class SocketService {

    private socket: Socket;

    constructor(socket: Socket) {
        this.socket = io(BASE_URL,{
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
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
    }

    getSocket(){
        return this.socket;
    }

    // El socket es compartido por todas las pantallas; si nadie lo está conectando, se conecta al usarlo.
    // `active` cubre también el "conectando", para no mandar dos conexiones a la vez
    private ensureConnected() {
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

    // Se llama al cerrar sesión: la conexión quedó autenticada con el usuario que sale
    disconnect() {
        this.socket.disconnect();
    }

}
