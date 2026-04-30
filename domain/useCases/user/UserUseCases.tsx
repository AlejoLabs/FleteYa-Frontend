import { UpdateImageUserUseCase } from "./UpdateImageUserUseCase";
import { UpdateUserUseCase } from "./UpdateUserUseCase";

export class UserUseCases {

    update: UpdateUserUseCase;
    updateWithImage: UpdateImageUserUseCase;

    constructor(
        {
            updateUserUseCase,
            updateImageUserUseCase
        }: 
        {
            updateUserUseCase: UpdateUserUseCase,
            updateImageUserUseCase: UpdateImageUserUseCase
         }
    ) {
        this.update = updateUserUseCase;
        this.updateWithImage = updateImageUserUseCase;
    }
}