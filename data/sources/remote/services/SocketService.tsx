import { Socket } from "socket.io-client";
import io from "socket.io-client";

export class SocketService {

    private socket: Socket;

    constructor(socket: Socket) {
        this.socket = io('BASE_URL',{
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });
    }

    getSocket(){
        return this.socket;
    }
    
    sendMessage(event: string, message: any) {
        this.socket.emit(event, message);
    }

    onMessage(event: string, callback: (...args: any[]) => void) {
        this.socket.on(event, callback);
    }

    disconnect() {
        this.socket.disconnect();
    }

}
