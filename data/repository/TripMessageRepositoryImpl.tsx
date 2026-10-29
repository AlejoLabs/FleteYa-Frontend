import { ErrorResponse } from "../../domain/models/ErrorResponse";
import { TripMessage } from "../../domain/models/TripMessage";
import { TripMessageRepository } from "../../domain/repository/TripMessageRepository";
import { TripMessageService } from "../sources/remote/services/TripMessageService";

export class TripMessageRepositoryImpl implements TripMessageRepository {

    private tripMessageService: TripMessageService;

    constructor({ tripMessageService }: { tripMessageService: TripMessageService }) {
        this.tripMessageService = tripMessageService;
    }

    async getMessages(idClientRequest: number): Promise<TripMessage[] | ErrorResponse> {
        return await this.tripMessageService.getMessages(idClientRequest);
    }
    async sendMessage(idClientRequest: number, text: string): Promise<TripMessage | ErrorResponse> {
        return await this.tripMessageService.sendMessage(idClientRequest, text);
    }
    async markRead(idClientRequest: number): Promise<boolean | ErrorResponse> {
        return await this.tripMessageService.markRead(idClientRequest);
    }
}
