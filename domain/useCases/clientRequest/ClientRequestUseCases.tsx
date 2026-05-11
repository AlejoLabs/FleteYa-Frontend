import { CreateClientRequestUseCase } from "./CreateClientRequestUseCase";
import { GetByClientAssignedUseCase } from "./GetByClientAssignedUseCase";
import { GetByDriverAssignedUseCase } from "./GetByDriverAssignedUseCase";
import { GetClientRequestByIdUseCase } from "./GetClientRequestByIdUseCase";
import { GetNearbyTripRequestUseCase } from "./GetNearbyTripRequestUseCase";
import { GetTimeAndDistanceUseCase } from "./GetTimeAndDistanceUseCase";
import { UpdateClientRatingUseCase } from "./UpdateClientRatingUseCase";
import { UpdateDriverAssignedUseCase } from "./UpdateDriverAssignedUseCase";
import { UpdateDriverRatingUseCase } from "./UpdateDriverRatingUseCase";
import { UpdateStatusUseCase } from "./UpdateStatusUseCase";

export class ClientRequestUseCases {
    getTimeAndDistanceUseCase: GetTimeAndDistanceUseCase;
    getNearbyTripRequestUseCase: GetNearbyTripRequestUseCase;
    getClientRequestById: GetClientRequestByIdUseCase;
    create: CreateClientRequestUseCase;
    updateDriverAssigned: UpdateDriverAssignedUseCase;
    updateStatus: UpdateStatusUseCase;
    updateDriverRating: UpdateDriverRatingUseCase;
    updateClientRating: UpdateClientRatingUseCase;
    getByClientAssigned: GetByClientAssignedUseCase;
    getByDriverAssigned: GetByDriverAssignedUseCase;

    constructor(
        {
            getTimeAndDistanceUseCase,
            getNearbyTripRequestUseCase,
            getClientRequestByIdUseCase,
            createClientRequestUseCase,
            updateDriverAssignedUseCase,
            updateStatusUseCase,
            updateDriverRatingUseCase,
            updateClientRatingUseCase,
            getByClientAssignedUseCase,
            getByDriverAssignedUseCase
        }: {
            getTimeAndDistanceUseCase: GetTimeAndDistanceUseCase;
            getNearbyTripRequestUseCase: GetNearbyTripRequestUseCase;
            getClientRequestByIdUseCase: GetClientRequestByIdUseCase;
            createClientRequestUseCase: CreateClientRequestUseCase;
            updateDriverAssignedUseCase: UpdateDriverAssignedUseCase;
            updateStatusUseCase: UpdateStatusUseCase;
            updateDriverRatingUseCase: UpdateDriverRatingUseCase;
            updateClientRatingUseCase: UpdateClientRatingUseCase;
            getByClientAssignedUseCase: GetByClientAssignedUseCase;
            getByDriverAssignedUseCase: GetByDriverAssignedUseCase;
        }
    ) {
        this.getTimeAndDistanceUseCase = getTimeAndDistanceUseCase;
        this.getNearbyTripRequestUseCase = getNearbyTripRequestUseCase;
        this.getClientRequestById = getClientRequestByIdUseCase;
        this.create = createClientRequestUseCase;
        this.updateDriverAssigned = updateDriverAssignedUseCase;
        this.updateStatus = updateStatusUseCase;
        this.updateDriverRating = updateDriverRatingUseCase;
        this.updateClientRating = updateClientRatingUseCase;
        this.getByClientAssigned = getByClientAssignedUseCase;
        this.getByDriverAssigned = getByDriverAssignedUseCase;
        
    }
}