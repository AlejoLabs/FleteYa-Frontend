import { UpdateImageUserUseCase } from "./UpdateImageUserUseCase";
import { UpdateUserUseCase } from "./UpdateUserUseCase";
import { SaveNotificationTokenUseCase } from "./SaveNotificationTokenUseCase";

export class UserUseCases {

    update: UpdateUserUseCase;
    updateWithImage: UpdateImageUserUseCase;
    saveNotificationToken: SaveNotificationTokenUseCase;

    constructor(
        {
            updateUserUseCase,
            updateImageUserUseCase,
            saveNotificationTokenUseCase
        }: 
        {
            updateUserUseCase: UpdateUserUseCase,
            updateImageUserUseCase: UpdateImageUserUseCase,
            saveNotificationTokenUseCase: SaveNotificationTokenUseCase
         }
    ) {
        this.update = updateUserUseCase;
        this.updateWithImage = updateImageUserUseCase;
        this.saveNotificationToken = saveNotificationTokenUseCase;
    }
}