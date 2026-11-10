import { ErrorResponse } from "../../../../domain/models/ErrorResponse";
import { User } from "../../../../domain/models/User";
import { UserUseCases } from "../../../../domain/useCases/user/UserUseCases";
import { t } from '../../../../i18n';
import { accountPhoneError } from "../../../utils/Countries";

export interface ProfileForm {
    name: string;
    lastname: string;
    phone: string;
    // País del indicativo: cambiarlo cambia el país de la cuenta (y las reglas de placa y documentos)
    countryCode: string;
}

export type ProfileErrors = Partial<Record<keyof ProfileForm, string>>;

// Editar el nombre, el celular y la foto de perfil
export class ProfileUpdateViewModel {
    private userUseCases: UserUseCases;

    constructor(userUseCases: UserUseCases) {
        this.userUseCases = userUseCases;
    }

    // Las mismas reglas del registro: nombre y apellido de 2 letras o más y el celular con el formato de su país
    // (en Colombia, 10 dígitos)
    validate(form: ProfileForm): ProfileErrors {
        const errors: ProfileErrors = {};
        if (form.name.trim().length < 2) errors.name = t('profileUpdate.escribeTuNombre');
        if (form.lastname.trim().length < 2) errors.lastname = t('profileUpdate.escribeTuApellido');
        const phoneError = accountPhoneError(form.phone, form.countryCode, t('profileUpdate.debeTener10Digitos'));
        if (phoneError) errors.phone = phoneError;
        return errors;
    }

    // Llamar solo después de validate() sin errores. Con foto nueva se sube junto con los datos
    async save(user: User, form: ProfileForm, imageUri: string | null): Promise<User | ErrorResponse> {
        // Solo los campos que se editan, como antes: no se reenvían los roles ni el resto de la sesión
        const updated: User = {
            id: user.id,
            email: user.email,
            image: imageUri ?? user.image,
            name: form.name.trim(),
            lastname: form.lastname.trim(),
            phone: form.phone.replace(/\D/g, ''),
            country_code: form.countryCode,
        };
        return imageUri ? await this.updateWithImage(updated, imageUri) : await this.update(updated);
    }

    async update(user: User): Promise<User | ErrorResponse> {
        return await this.userUseCases.update.execute(user);
    }

    async updateWithImage(user: User, image: string): Promise<User | ErrorResponse> {
        return await this.userUseCases.updateWithImage.execute(user, image);
    }
}
