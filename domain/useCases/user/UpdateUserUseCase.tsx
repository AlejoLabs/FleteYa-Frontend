import { ErrorResponse } from "../../models/ErrorResponse";
import { User } from "../../models/User";
import { UserRepository } from "../../repository/UserRepository";

export class UpdateUserUseCase {

    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    async execute(user: User): Promise<User | ErrorResponse> {
        return await this.userRepository.update(user);
    }
}