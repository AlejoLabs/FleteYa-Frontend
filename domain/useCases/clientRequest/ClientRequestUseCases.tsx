import { CreateClientRequestUseCase } from "./CreateClientRequestUseCase";
import { GetClientRequestByIdUseCase } from "./GetClientRequestByIdUseCase";
import { GetNearbyTripRequestUseCase } from "./GetNearbyTripRequestUseCase";
import { GetTimeAndDistanceUseCase } from "./GetTimeAndDistanceUseCase";
import { UpdateDriverAssignedUseCase } from "./UpdateDriverAssignedUseCase";
import { UpdateStatusUseCase } from "./UpdateStatusUseCase";

export class ClientRequestUseCases {
    getTimeAndDistanceUseCase: GetTimeAndDistanceUseCase;
    getNearbyTripRequestUseCase: GetNearbyTripRequestUseCase;
    getClientRequestById: GetClientRequestByIdUseCase;
    create: CreateClientRequestUseCase;
    updateDriverAssigned: UpdateDriverAssignedUseCase;
    updateStatus: UpdateStatusUseCase;

    constructor(
        {
            getTimeAndDistanceUseCase,
            getNearbyTripRequestUseCase,
            getClientRequestByIdUseCase,
            createClientRequestUseCase,
            updateDriverAssignedUseCase,
            updateStatusUseCase
        }: {
            getTimeAndDistanceUseCase: GetTimeAndDistanceUseCase;
            getNearbyTripRequestUseCase: GetNearbyTripRequestUseCase;
            getClientRequestByIdUseCase: GetClientRequestByIdUseCase;
            createClientRequestUseCase: CreateClientRequestUseCase;
            updateDriverAssignedUseCase: UpdateDriverAssignedUseCase;
            updateStatusUseCase: UpdateStatusUseCase;
        }
    ) {
        this.getTimeAndDistanceUseCase = getTimeAndDistanceUseCase;
        this.getNearbyTripRequestUseCase = getNearbyTripRequestUseCase;
        this.getClientRequestById = getClientRequestByIdUseCase;
        this.create = createClientRequestUseCase;
        this.updateDriverAssigned = updateDriverAssignedUseCase;
        this.updateStatus = updateStatusUseCase;
        
    }
}