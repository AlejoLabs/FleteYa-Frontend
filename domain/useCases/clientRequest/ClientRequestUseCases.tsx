import { GetTimeAndDistanceUseCase } from "./GetTimeAndDistanceUseCase";

export class ClientRequestUseCases {
    getTimeAndDistanceUseCase: GetTimeAndDistanceUseCase;

    constructor(
        {
            getTimeAndDistanceUseCase
        }: {
            getTimeAndDistanceUseCase: GetTimeAndDistanceUseCase;
        }
    ) {
        this.getTimeAndDistanceUseCase = getTimeAndDistanceUseCase;
    }
}