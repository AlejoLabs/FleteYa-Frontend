import { Role } from "./Role";

export interface User {
    id?:                 number;
    name:               string;
    lastname:           string;
    email:              string;
    phone:              string;
    image?:              string;
    notification_token?: null;
    roles:              Role[];
}