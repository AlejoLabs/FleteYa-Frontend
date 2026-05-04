import { CreateClientRequestUseCase } from "./CreateClientRequestUseCase";
import { GetTimeAndDistanceUseCase } from "./GetTimeAndDistanceUseCase";

export class ClientRequestUseCases {
    getTimeAndDistanceUseCase: GetTimeAndDistanceUseCase;
    create: CreateClientRequestUseCase;

    constructor(
        {
            getTimeAndDistanceUseCase,
            createClientRequestUseCase
        }: {
            getTimeAndDistanceUseCase: GetTimeAndDistanceUseCase;
            createClientRequestUseCase: CreateClientRequestUseCase;
        }
    ) {
        this.getTimeAndDistanceUseCase = getTimeAndDistanceUseCase;
        this.create = createClientRequestUseCase;
    }
}