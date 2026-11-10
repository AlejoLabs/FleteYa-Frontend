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
    // Cómo puede entrar: con contraseña, con Google o con las dos
    has_password?:       boolean;
    has_google?:         boolean;
    // Idioma de la app de esta persona (es, en, fr, it, pt, de)
    language?:           string;
    // País de la persona (CO, FR...): sale del indicativo de su celular. Decide las reglas de placa y documentos
    country_code?:       string;
}