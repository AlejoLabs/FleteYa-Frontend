import { GetTripMessagesUseCase } from "./GetTripMessagesUseCase";
import { SendTripMessageUseCase } from "./SendTripMessageUseCase";
import { MarkTripMessagesReadUseCase } from "./MarkTripMessagesReadUseCase";

export class TripMessageUseCases {
    getMessages: GetTripMessagesUseCase;
    sendMessage: SendTripMessageUseCase;
    markRead: MarkTripMessagesReadUseCase;

    constructor(
        {
            getTripMessagesUseCase,
            sendTripMessageUseCase,
            markTripMessagesReadUseCase
        }:
        {
            getTripMessagesUseCase: GetTripMessagesUseCase;
            sendTripMessageUseCase: SendTripMessageUseCase;
            markTripMessagesReadUseCase: MarkTripMessagesReadUseCase;
        }
    ){
        this.getMessages = getTripMessagesUseCase;
        this.sendMessage = sendTripMessageUseCase;
        this.markRead = markTripMessagesReadUseCase;
    }
}
