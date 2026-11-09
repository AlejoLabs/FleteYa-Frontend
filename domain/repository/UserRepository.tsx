import { ErrorResponse } from "../models/ErrorResponse";
import { User } from "../models/User";

export interface UserRepository {

    update(user: User): Promise<User | ErrorResponse>;
    updateWithImage(user: User, image: string): Promise<User | ErrorResponse>;
    saveNotificationToken(token: string | null): Promise<boolean | ErrorResponse>;
    updateLanguage(language: string): Promise<{ language: string } | ErrorResponse>;

}