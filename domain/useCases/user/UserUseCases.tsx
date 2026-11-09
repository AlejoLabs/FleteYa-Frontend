import { UpdateImageUserUseCase } from "./UpdateImageUserUseCase";
import { UpdateUserUseCase } from "./UpdateUserUseCase";
import { SaveNotificationTokenUseCase } from "./SaveNotificationTokenUseCase";
import { UpdateLanguageUseCase } from "./UpdateLanguageUseCase";

export class UserUseCases {

    update: UpdateUserUseCase;
    updateWithImage: UpdateImageUserUseCase;
    saveNotificationToken: SaveNotificationTokenUseCase;
    updateLanguage: UpdateLanguageUseCase;

    constructor(
        {
            updateUserUseCase,
            updateImageUserUseCase,
            saveNotificationTokenUseCase,
            updateLanguageUseCase
        }:
        {
            updateUserUseCase: UpdateUserUseCase,
            updateImageUserUseCase: UpdateImageUserUseCase,
            saveNotificationTokenUseCase: SaveNotificationTokenUseCase,
            updateLanguageUseCase: UpdateLanguageUseCase
         }
    ) {
        this.update = updateUserUseCase;
        this.updateWithImage = updateImageUserUseCase;
        this.saveNotificationToken = saveNotificationTokenUseCase;
        this.updateLanguage = updateLanguageUseCase;
    }
}
