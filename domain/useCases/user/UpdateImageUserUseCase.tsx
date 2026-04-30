import { ErrorResponse } from "../../models/ErrorResponse";
import { User } from "../../models/User";
import { UserRepository } from "../../repository/UserRepository";

export class UpdateImageUserUseCase {

    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    async execute(user: User, image: string): Promise<User | ErrorResponse> {
        return await this.userRepository.updateWithImage(user, image);
    }
}