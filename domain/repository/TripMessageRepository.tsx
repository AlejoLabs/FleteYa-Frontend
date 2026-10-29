import { ErrorResponse } from "../models/ErrorResponse";
import { TripMessage } from "../models/TripMessage";

export interface TripMessageRepository {

    getMessages(idClientRequest: number): Promise<TripMessage[] | ErrorResponse>;
    sendMessage(idClientRequest: number, text: string): Promise<TripMessage | ErrorResponse>;
    markRead(idClientRequest: number): Promise<boolean | ErrorResponse>;
}
