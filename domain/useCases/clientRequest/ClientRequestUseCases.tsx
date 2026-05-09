import { CreateClientRequestUseCase } from "./CreateClientRequestUseCase";
import { GetNearbyTripRequestUseCase } from "./GetNearbyTripRequestUseCase";
import { GetTimeAndDistanceUseCase } from "./GetTimeAndDistanceUseCase";
import { UpdateDriverAssignedUseCase } from "./UpdateDriverAssignedUseCase";

export class ClientRequestUseCases {
    getTimeAndDistanceUseCase: GetTimeAndDistanceUseCase;
    getNearbyTripRequestUseCase: GetNearbyTripRequestUseCase;
    create: CreateClientRequestUseCase;
    updateDriverAssigned: UpdateDriverAssignedUseCase;

    constructor(
        {
            getTimeAndDistanceUseCase,
            getNearbyTripRequestUseCase,
            createClientRequestUseCase,
            updateDriverAssignedUseCase
        }: {
            getTimeAndDistanceUseCase: GetTimeAndDistanceUseCase;
            getNearbyTripRequestUseCase: GetNearbyTripRequestUseCase;
            createClientRequestUseCase: CreateClientRequestUseCase;
            updateDriverAssignedUseCase: UpdateDriverAssignedUseCase;
        }
    ) {
        this.getTimeAndDistanceUseCase = getTimeAndDistanceUseCase;
        this.getNearbyTripRequestUseCase = getNearbyTripRequestUseCase;
        this.create = createClientRequestUseCase;
        this.updateDriverAssigned = updateDriverAssignedUseCase;
        
    }
}