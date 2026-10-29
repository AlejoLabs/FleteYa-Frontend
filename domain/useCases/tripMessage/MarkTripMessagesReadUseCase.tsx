import { TripMessageRepository } from "../../repository/TripMessageRepository";
import { ErrorResponse } from "../../models/ErrorResponse";

export class MarkTripMessagesReadUseCase {
    private tripMessageRepository: TripMessageRepository;

    constructor({tripMessageRepository}: {tripMessageRepository: TripMessageRepository}){
        this.tripMessageRepository = tripMessageRepository;
    }

    async execute(idClientRequest: number): Promise<boolean | ErrorResponse> {
        return await this.tripMessageRepository.markRead(idClientRequest);
    }
}
