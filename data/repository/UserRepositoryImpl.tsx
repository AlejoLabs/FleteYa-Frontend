import { ErrorResponse } from "../../domain/models/ErrorResponse";
import { User } from "../../domain/models/User";
import { UserRepository } from "../../domain/repository/UserRepository";
import { UserService } from "../sources/remote/services/UserService";

export class UserRepositoryImpl implements UserRepository {

    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    async update(user: User): Promise<User | ErrorResponse> {
        return await this.userService.update(user);
    }
    async saveNotificationToken(token: string | null): Promise<boolean | ErrorResponse> {
        return await this.userService.saveNotificationToken(token);
    }

    async updateLanguage(language: string): Promise<{ language: string } | ErrorResponse> {
        return await this.userService.updateLanguage(language);
    }

    async updateWithImage(user: User, image: string): Promise<User | ErrorResponse> {
        return await this.userService.updateWithImage(user, image);
    }

}