import { Socket } from "socket.io-client";
import io from "socket.io-client";
import { BASE_URL } from "../api/ApiRequestHandler";

export class SocketService {

    private socket: Socket;

    constructor(socket: Socket) {
        this.socket = io(BASE_URL,{
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });
    }

    getSocket(){
        return this.socket;
    }
    
    // El socket es compartido por todas las pantallas; si una lo desconectó, se vuelve a conectar al usarlo
    private ensureConnected() {
        if (!this.socket.connected) {
            this.socket.connect();
        }
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

    disconnect() {
        this.socket.disconnect();
    }

}
