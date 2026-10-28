import { AuthResponse } from "../../../../domain/models/AuthResponse";
import { ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { User } from "../../../../domain/models/User";
import { AuthUseCases } from "../../../../domain/useCases/auth/AuthUseCases";
import { DriverVehicle } from "../../../../domain/models/DriverVehicle";

export class RegisterViewModel {

    private authUseCases: AuthUseCases;

    constructor({authUseCases}: {authUseCases: AuthUseCases}){
        this.authUseCases = authUseCases;
    }

    async register(user: User): Promise<AuthResponse | ErrorResponse>{
        return await this.authUseCases.register.execute(user);
    }

    async registerDriver(user: User, vehicle: DriverVehicle): Promise<AuthResponse | ErrorResponse>{
        return await this.authUseCases.registerDriver.execute(user, vehicle);
    }
}