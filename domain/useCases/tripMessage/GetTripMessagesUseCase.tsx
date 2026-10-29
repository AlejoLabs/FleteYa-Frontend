import { TripMessageRepository } from "../../repository/TripMessageRepository";
import { ErrorResponse } from "../../models/ErrorResponse";
import { TripMessage } from "../../models/TripMessage";

export class GetTripMessagesUseCase {
    private tripMessageRepository: TripMessageRepository;

    constructor({tripMessageRepository}: {tripMessageRepository: TripMessageRepository}){
        this.tripMessageRepository = tripMessageRepository;
    }

    async execute(idClientRequest: number): Promise<TripMessage[] | ErrorResponse> {
        return await this.tripMessageRepository.getMessages(idClientRequest);
    }
}
