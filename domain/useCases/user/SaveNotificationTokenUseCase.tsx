import { ErrorResponse } from "../../models/ErrorResponse";
import { UserRepository } from "../../repository/UserRepository";

// null al cerrar sesión: ese teléfono deja de recibir notificaciones de la cuenta
export class SaveNotificationTokenUseCase {

    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    async execute(token: string | null): Promise<boolean | ErrorResponse> {
        return await this.userRepository.saveNotificationToken(token);
    }
}
