import { Role } from "./Role";

export interface User {
    id?:                 number;
    name:               string;
    lastname:           string;
    email:              string;
    phone:              string;
    password?:           string;
    image?:              string;
    notification_token?: null;
    update_at?:          string;
    roles?:              Role[];
}