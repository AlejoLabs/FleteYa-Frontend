import { ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { User } from "../../../../domain/models/User";
import { UserUseCases } from "../../../../domain/useCases/user/UserUseCases";

export class ProfileUpdateViewModel {
    private userUseCases: UserUseCases;

    constructor(userUseCases: UserUseCases) {
        this.userUseCases = userUseCases;   
    }

    async update(user: User): Promise<User | ErrorResponse> {
        return await this.userUseCases.update.execute(user);
    }

    async updateWithImage(user: User, image: string): Promise<User | ErrorResponse> {
        return await this.userUseCases.updateWithImage.execute(user, image);
    }
}