import { ErrorResponse } from "../../models/ErrorResponse";
import { UserRepository } from "../../repository/UserRepository";

// Guarda en la cuenta el idioma elegido: en él llegan las notificaciones y los correos
export class UpdateLanguageUseCase {

    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    async execute(language: string): Promise<{ language: string } | ErrorResponse> {
        return await this.userRepository.updateLanguage(language);
    }
}
