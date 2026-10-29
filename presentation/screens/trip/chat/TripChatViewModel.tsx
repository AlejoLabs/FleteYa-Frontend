import { SocketService } from "../../../../data/sources/remote/services/SocketService";
import { TripMessage } from "../../../../domain/models/TripMessage";
import { TripMessageUseCases } from "../../../../domain/useCases/tripMessage/TripMessageUseCases";

export const MAX_MESSAGE_LENGTH = 500;

// Chat del viaje: la misma pantalla la usan el cliente y el conductor
export class TripChatViewModel {

    private tripMessageUseCases: TripMessageUseCases;
    private socketService: SocketService;

    constructor(
        {
            tripMessageUseCases,
            socketService
        }:
        {
            tripMessageUseCases: TripMessageUseCases,
            socketService: SocketService
        }
    ) {
        this.tripMessageUseCases = tripMessageUseCases;
        this.socketService = socketService;
    }

    async getMessages(idClientRequest: number) {
        return await this.tripMessageUseCases.getMessages.execute(idClientRequest);
    }

    async sendMessage(idClientRequest: number, text: string) {
        return await this.tripMessageUseCases.sendMessage.execute(idClientRequest, text.trim());
    }

    async markRead(idClientRequest: number) {
        return await this.tripMessageUseCases.markRead.execute(idClientRequest);
    }

    canSend(text: string) {
        const trimmed = text.trim();
        return trimmed.length > 0 && trimmed.length <= MAX_MESSAGE_LENGTH;
    }

    // Agrega un mensaje sin repetirlo: el propio llega en la respuesta y el del otro por el socket
    addMessage(messages: TripMessage[], message: TripMessage) {
        return messages.some((current) => current.id === message.id) ? messages : [...messages, message];
    }

    listenerTripMessage(idClientRequest: number, callback: (message: TripMessage) => void) {
        return this.socketService.onMessage(`trip_message/${idClientRequest}`, callback);
    }

    // El chat se cierra cuando el viaje termina o alguien lo cancela
    listenerTripClosed(idClientRequest: number, callback: () => void) {
        const offStatus = this.socketService.onMessage(`new_status_trip/${idClientRequest}`, (data: any) => {
            if (data?.status === 'FINISHED') callback();
        });
        const offCanceled = this.socketService.onMessage(`trip_canceled/${idClientRequest}`, () => callback());
        return () => {
            offStatus();
            offCanceled();
        };
    }
}
