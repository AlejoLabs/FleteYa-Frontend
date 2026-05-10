import { CreateClientRequestUseCase } from "./CreateClientRequestUseCase";
import { GetClientRequestByIdUseCase } from "./GetClientRequestByIdUseCase";
import { GetNearbyTripRequestUseCase } from "./GetNearbyTripRequestUseCase";
import { GetTimeAndDistanceUseCase } from "./GetTimeAndDistanceUseCase";
import { UpdateDriverAssignedUseCase } from "./UpdateDriverAssignedUseCase";

export class ClientRequestUseCases {
    getTimeAndDistanceUseCase: GetTimeAndDistanceUseCase;
    getNearbyTripRequestUseCase: GetNearbyTripRequestUseCase;
    getClientRequestById: GetClientRequestByIdUseCase;
    create: CreateClientRequestUseCase;
    updateDriverAssigned: UpdateDriverAssignedUseCase;

    constructor(
        {
            getTimeAndDistanceUseCase,
            getNearbyTripRequestUseCase,
            getClientRequestByIdUseCase,
            createClientRequestUseCase,
            updateDriverAssignedUseCase
        }: {
            getTimeAndDistanceUseCase: GetTimeAndDistanceUseCase;
            getNearbyTripRequestUseCase: GetNearbyTripRequestUseCase;
            getClientRequestByIdUseCase: GetClientRequestByIdUseCase;
            createClientRequestUseCase: CreateClientRequestUseCase;
            updateDriverAssignedUseCase: UpdateDriverAssignedUseCase;
        }
    ) {
        this.getTimeAndDistanceUseCase = getTimeAndDistanceUseCase;
        this.getNearbyTripRequestUseCase = getNearbyTripRequestUseCase;
        this.getClientRequestById = getClientRequestByIdUseCase;
        this.create = createClientRequestUseCase;
        this.updateDriverAssigned = updateDriverAssignedUseCase;
        
    }
}