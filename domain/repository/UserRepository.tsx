import { ErrorResponse } from "../models/ErrorResponse";
import { User } from "../models/User";

export interface UserRepository {

    update(user: User): Promise<User | ErrorResponse>;
    updateWithImage(user: User, image: string): Promise<User | ErrorResponse>;

}