import { ErrorResponse } from "../../models/ErrorResponse";
import { AuthRepository } from "../../repository/AuthRepository";
import { AuthResponse } from "../../models/AuthResponse";
import { User } from "../../models/User";
import { DriverVehicle } from "../../models/DriverVehicle";

export class RegisterDriverUseCase {

    private authRepository: AuthRepository;

    constructor({authRepository}: {authRepository: AuthRepository}){
        this.authRepository = authRepository;
    }

    async execute(user: User, vehicle: DriverVehicle): Promise<AuthResponse | ErrorResponse>{
        return await this.authRepository.registerDriver(user, vehicle);
    }
}
